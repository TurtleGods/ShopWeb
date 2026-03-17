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
        return AuthResult.Success(token, user.Email, user.Role.ToString());
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var role = string.IsNullOrWhiteSpace(request.StoreName) ? UserRole.Buyer : UserRole.Seller;

        var exists = await _userManager.Users.AnyAsync(
            x => x.Email == request.Email,
            ct);

        if (exists)
        {
            return AuthResult.Fail("Email already exists.");
        }

        var user = new User
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            StoreName = request.StoreName,
            Role = role
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return AuthResult.Fail(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        var token = await _jwtTokenService.CreateTokenAsync(user, ct);
        return AuthResult.Success(token, user.Email, user.Role.ToString());
    }
}
