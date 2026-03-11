using System.Linq;
using System.Security.Claims;
using System.Threading;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopping.Application.Contracts.Products;
using Shopping.Domain.Entities;
using Shopping.Domain.Enums;
using Shopping.Infrastructure.Data;
using Shopping.Infrastructure.Services;

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
            .Select(x => new
            {
                x.Id,
                x.Name,
                x.Description,
                x.Price,
                x.Stock,
                x.IsPublished,
                x.SellerId,
                Images = x.Images.Select(i => new { i.Url, i.PublicId }).ToList()
            })
            .ToListAsync(ct);

        return Ok(all);
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

        var seller = await _db.Users.FirstOrDefaultAsync(x => x.Email == emailClaim && x.Role == UserRole.Seller, ct);
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

        return Created($"/api/v1/products/{product.Id}", product);
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

        var seller = await _db.Users.FirstOrDefaultAsync(x => x.Email == email && x.Role == UserRole.Seller, ct);
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
}
