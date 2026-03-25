using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopping.Domain.Enums;
using Shopping.Infrastructure.Data;

namespace Shopping.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class OrdersController : ControllerBase
{
    private readonly AppDbContext _db;

    public OrdersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpPost("buyer")]
    [Authorize]
    public async Task<IActionResult> BuyerPage(CancellationToken ct)
    {
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        if (string.IsNullOrWhiteSpace(email))
        {
            return Unauthorized();
        }

        var user = await _db.Users.FirstOrDefaultAsync(x => x.Email == email && x.IsActive, ct);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new { message = "Order flow placeholder", buyerId = user.Id });
    }

    [HttpGet("seller")]
    [Authorize(Policy = "SellerOnly")]
    public async Task<IActionResult> SellerPage(CancellationToken ct)
    {
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

        var sellerOrders = await _db.Orders
            .Where(o => _db.OrderItems.Any(i => i.OrderId == o.Id && _db.Products.Any(p => p.Id == i.ProductId && p.SellerId == seller.Id)))
            .Select(o => new { o.Id, o.TotalAmount, o.Status, o.CreatedAt })
            .ToListAsync(ct);

        return Ok(sellerOrders);
    }
}
