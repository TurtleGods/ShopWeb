using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using System.Linq;
using Shopping.Application.Contracts.Auth;
using Shopping.Application.Services;
using Shopping.Domain.Entities;
using Shopping.Infrastructure.Interfaces;
using Shopping.Infrastructure.Security;
using Shopping.Domain.Enums;
using System.Threading;
using System.Threading.Tasks;

namespace Shopping.Infrastructure.Services;

public sealed class AuthService : IAuthService
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly UserManager<User> _userManager;

    public AuthService(UserManager<User> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userManager.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email && x.IsActive, ct);

        if (user is null)
        {
            return AuthResult.Fail("User not found.");
        }

        var passwordValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!passwordValid)
        {
            return AuthResult.Fail("Invalid password.");
        }

        var token = await _jwtTokenService.CreateTokenAsync(user, ct);
        return AuthResult.Success(token, user.Email!, user.Role.ToString(), user.PublicUserId);
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var publicUserId = NormalizePublicUserId(request.PublicUserId);
        if (string.IsNullOrWhiteSpace(publicUserId))
        {
            return AuthResult.Fail("Public user ID is required.");
        }

        if (!IsValidPublicUserId(publicUserId))
        {
            return AuthResult.Fail("Public user ID can only contain lowercase letters, numbers, and hyphens.");
        }

        var exists = await _userManager.Users.AnyAsync(
            x => x.Email == request.Email,
            ct);

        if (exists)
        {
            return AuthResult.Fail("Email already exists.");
        }

        var publicUserIdExists = await _userManager.Users.AnyAsync(
            x => x.PublicUserId == publicUserId,
            ct);

        if (publicUserIdExists)
        {
            return AuthResult.Fail("Public user ID already exists.");
        }

        var user = new User
        {
            UserName = publicUserId,
            Email = request.Email,
            PublicUserId = publicUserId,
            Role = UserRole.Seller
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return AuthResult.Fail(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        var token = await _jwtTokenService.CreateTokenAsync(user, ct);
        return AuthResult.Success(token, user.Email!, user.Role.ToString(), user.PublicUserId);
    }

    private static string NormalizePublicUserId(string value)
    {
        return value.Trim().ToLowerInvariant();
    }

    private static bool IsValidPublicUserId(string value)
    {
        if (value.Length is < 3 or > 50)
        {
            return false;
        }

        return value.All(c => char.IsLower(c) || char.IsDigit(c) || c == '-');
    }
}
