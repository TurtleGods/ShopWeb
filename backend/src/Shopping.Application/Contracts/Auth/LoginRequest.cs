using Shopping.Domain.Enums;

namespace Shopping.Application.Contracts.Auth;

public sealed class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Buyer;
}

