using Shopping.Domain.Enums;

namespace Shopping.Application.Contracts.Auth;

public sealed class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? StoreName { get; set; }
    public UserRole Role { get; set; } = UserRole.Buyer;
}

