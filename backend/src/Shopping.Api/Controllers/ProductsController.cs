using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopping.Application.Contracts.Products;
using Shopping.Application.Services;
using Shopping.Domain.Entities;
using Shopping.Domain.Enums;
using Shopping.Infrastructure.Data;

namespace Shopping.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProductsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IImageStorageService _imageStorageService;

    public ProductsController(AppDbContext db, IImageStorageService imageStorageService)
    {
        _db = db;
        _imageStorageService = imageStorageService;
    }

    [HttpGet]
    public async Task<IActionResult> List(CancellationToken ct)
    {
        var all = await _db.Products
            .Include(x => x.Images)
            .Include(x => x.Seller)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Description,
                x.Price,
                x.Stock,
                x.IsPublished,
                x.SellerId,
                SellerPublicUserId = x.Seller.PublicUserId,
                Images = x.Images.Select(i => new { i.Url, i.PublicId }).ToList()
            })
            .ToListAsync(ct);

        return Ok(all);
    }

    [HttpGet("user/{publicUserId}")]
    public async Task<IActionResult> ListByUserId(string publicUserId, CancellationToken ct)
    {
        var normalizedPublicUserId = publicUserId.Trim().ToLowerInvariant();
        var seller = await _db.Users
            .FirstOrDefaultAsync(x => x.PublicUserId == normalizedPublicUserId && x.IsActive && x.Role == UserRole.Seller, ct);

        if (seller is null)
        {
            return NotFound(new { message = "User page not found." });
        }

        var products = await _db.Products
            .Where(x => x.SellerId == seller.Id)
            .Include(x => x.Images)
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Description,
                x.Price,
                x.Stock,
                x.IsPublished,
                x.SellerId,
                SellerPublicUserId = seller.PublicUserId,
                Images = x.Images.Select(i => new { i.Url, i.PublicId }).ToList()
            })
            .ToListAsync(ct);

        return Ok(new
        {
            seller.PublicUserId,
            Products = products
        });
    }

    [HttpPost]
    [Authorize(Policy = "SellerOnly")]
    public async Task<IActionResult> Create([FromBody] ProductCreateRequest request, CancellationToken ct)
    {
        var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
        var emailClaim = User.FindFirst(ClaimTypes.Email)?.Value;

        if ((roleClaim is not "Seller" and not "Admin") || string.IsNullOrWhiteSpace(emailClaim))
        {
            return Forbid();
        }

        var seller = await _db.Users.FirstOrDefaultAsync(x => x.Email == emailClaim && x.Role == UserRole.Seller && x.IsActive, ct);
        if (seller is null)
        {
            return Unauthorized();
        }

        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Stock = request.Stock,
            SellerId = seller.Id
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync(ct);

        return Created($"/api/products/{product.Id}", new
        {
            product.Id,
            product.Name,
            product.Description,
            product.Price,
            product.Stock,
            product.IsPublished,
            product.SellerId,
            SellerPublicUserId = seller.PublicUserId,
            Images = new object[0]
        });
    }

    [HttpPost("{productId:int}/images")]
    [Authorize(Policy = "SellerOnly")]
    public async Task<IActionResult> UploadImage(
        int productId,
        [FromForm] IFormFile? file,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            return BadRequest("Image file is required.");
        }

        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var seller = await _db.Users.FirstOrDefaultAsync(x => x.Email == email && x.Role == UserRole.Seller && x.IsActive, ct);
        if (seller is null)
        {
            return Unauthorized();
        }

        await using var stream = file.OpenReadStream();
        var result = await _imageStorageService.UploadProductImageAsync(stream, file.FileName, $"shop-products/{seller.Id}", ct);

        var image = new ProductImage
        {
            ProductId = productId,
            Url = result.url,
            PublicId = result.publicId
        };

        _db.ProductImages.Add(image);
        await _db.SaveChangesAsync(ct);

        return Ok(new { image.Url, image.PublicId });
    }

    [HttpDelete("{productId:int}")]
    [Authorize(Policy = "SellerOnly")]
    public async Task<IActionResult> Delete(int productId, CancellationToken ct)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(role))
        {
            return Unauthorized();
        }

        var product = await _db.Products
            .Include(x => x.Images)
            .FirstOrDefaultAsync(x => x.Id == productId, ct);

        if (product is null)
        {
            return NotFound(new { message = "Product not found." });
        }

        var isAdmin = string.Equals(role, UserRole.Admin.ToString(), System.StringComparison.Ordinal);
        if (!isAdmin)
        {
            var seller = await _db.Users.FirstOrDefaultAsync(x => x.Email == email && x.Role == UserRole.Seller && x.IsActive, ct);
            if (seller is null)
            {
                return Unauthorized();
            }

            if (product.SellerId != seller.Id)
            {
                return Forbid();
            }
        }

        var hasOrders = await _db.OrderItems.AnyAsync(x => x.ProductId == productId, ct);
        if (hasOrders)
        {
            return Conflict(new { message = "This product cannot be deleted because it already exists in an order." });
        }

        foreach (var image in product.Images)
        {
            await _imageStorageService.DeleteProductImageAsync(image.PublicId, ct);
        }

        _db.Products.Remove(product);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }
}
