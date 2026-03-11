using Microsoft.EntityFrameworkCore;
using Shopping.Application.Contracts.Auth;
using Shopping.Application.Services;
using Shopping.Domain.Entities;
using Shopping.Infrastructure.Data;
using Shopping.Infrastructure.Security;
using System.Threading;
using System.Threading.Tasks;

namespace Shopping.Infrastructure.Services;

public sealed class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(AppDbContext db, IJwtTokenService jwtTokenService)
    {
        _db = db;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _db.Users
            .FirstOrDefaultAsync(x => x.Email == request.Email && x.Role == request.Role, ct);

        if (user is null)
        {
            return AuthResult.Fail("User not found.");
        }

        if (user.PasswordHash != request.Password)
        {
            return AuthResult.Fail("Invalid password.");
        }

        var token = await _jwtTokenService.CreateTokenAsync(user, ct);
        return AuthResult.Success(token, user.Email, user.Role.ToString());
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        var exists = await _db.Users.AnyAsync(
            x => x.Email == request.Email && x.Role == request.Role,
            ct);

        if (exists)
        {
            return AuthResult.Fail("Email already exists for this role.");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = request.Password,
            FullName = request.FullName,
            StoreName = request.StoreName,
            Role = request.Role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        var token = await _jwtTokenService.CreateTokenAsync(user, ct);
        return AuthResult.Success(token, user.Email, user.Role.ToString());
    }
}

