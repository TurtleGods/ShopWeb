using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Shopping.Application.Services;
using Shopping.Domain.Entities;

namespace Shopping.Infrastructure.Security;

public interface IJwtTokenService
{
    Task<string> CreateTokenAsync(User user, CancellationToken ct = default);
}

public sealed class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public Task<string> CreateTokenAsync(User user, CancellationToken ct = default)
    {
        var key = _configuration["Jwt:Key"] ?? "change_me_to_a_long_secure_secret_32_chars_min";
        var issuer = _configuration["Jwt:Issuer"] ?? "ShoppingApi";
        var audience = _configuration["Jwt:Audience"] ?? "ShoppingClient";
        var ttlMinutes = int.TryParse(_configuration["Jwt:ExpirationMinutes"], out var parsed) ? parsed : 60;

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
            new Claim("full_name", user.FullName)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(ttlMinutes),
            signingCredentials: credentials);

        var tokenString = new JwtSecurityTokenHandler().WriteToken(token);
        return Task.FromResult(tokenString);
    }
}

