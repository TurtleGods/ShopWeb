namespace Shopping.Application.Contracts.Auth;

public sealed class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PublicUserId { get; set; } = string.Empty;
}
