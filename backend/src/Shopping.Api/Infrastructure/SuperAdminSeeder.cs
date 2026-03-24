using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Shopping.Api.Settings;
using Shopping.Domain.Entities;
using Shopping.Domain.Enums;

namespace Shopping.Api.Infrastructure;

public sealed class SuperAdminSeeder
{
    private readonly UserManager<User> _userManager;
    private readonly SuperAdminSettings _settings;

    public SuperAdminSeeder(UserManager<User> userManager, IOptions<SuperAdminSettings> settings)
    {
        _userManager = userManager;
        _settings = settings.Value;
    }

    public async Task SeedAsync(CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.Email) || string.IsNullOrWhiteSpace(_settings.Password))
        {
            return;
        }

        var existing = await _userManager.FindByEmailAsync(_settings.Email);
        if (existing is not null)
        {
            if (existing.Role != UserRole.Admin || !existing.IsActive || existing.PublicUserId != _settings.PublicUserId)
            {
                existing.Role = UserRole.Admin;
                existing.IsActive = true;
                existing.PublicUserId = _settings.PublicUserId;
                existing.UserName = _settings.PublicUserId;
                await _userManager.UpdateAsync(existing);
            }

            return;
        }

        var admin = new User
        {
            UserName = _settings.PublicUserId,
            Email = _settings.Email,
            PublicUserId = _settings.PublicUserId,
            Role = UserRole.Admin,
            IsActive = true
        };

        await _userManager.CreateAsync(admin, _settings.Password);
    }
}
