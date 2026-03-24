namespace Shopping.Application.Contracts.Admin;

public sealed class CreateSellerRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PublicUserId { get; set; } = string.Empty;
}
