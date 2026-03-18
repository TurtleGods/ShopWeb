using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopping.Application.Contracts.Admin;
using Shopping.Domain.Entities;
using Shopping.Domain.Enums;

namespace Shopping.Api.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = nameof(UserRole.Admin))]
public sealed class AdminUsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;

    public AdminUsersController(UserManager<User> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var users = await _userManager.Users
            .OrderBy(x => x.Id)
            .Select(x => new
            {
                x.Id,
                x.Email,
                x.FullName,
                Role = x.Role.ToString(),
                x.StoreName,
                x.IsActive
            })
            .ToListAsync(ct);

        return Ok(users);
    }

    [HttpPost("seller")]
    public async Task<IActionResult> CreateSeller([FromBody] CreateSellerRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.StoreName))
        {
            return BadRequest(new { message = "Store name is required." });
        }

        var exists = await _userManager.Users.AnyAsync(x => x.Email == request.Email, ct);
        if (exists)
        {
            return BadRequest(new { message = "Email already exists." });
        }

        var seller = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            StoreName = request.StoreName,
            Role = UserRole.Seller,
            IsActive = true
        };

        var result = await _userManager.CreateAsync(seller, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = string.Join(", ", result.Errors.Select(x => x.Description)) });
        }

        return Ok(new
        {
            seller.Id,
            seller.Email,
            seller.FullName,
            Role = seller.Role.ToString(),
            seller.StoreName,
            seller.IsActive
        });
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateUserStatusRequest request)
    {
        var user = await _userManager.FindByIdAsync(id.ToString());
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }

        user.IsActive = request.IsActive;
        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = string.Join(", ", result.Errors.Select(x => x.Description)) });
        }

        return Ok(new
        {
            user.Id,
            user.Email,
            user.FullName,
            Role = user.Role.ToString(),
            user.StoreName,
            user.IsActive
        });
    }
}
