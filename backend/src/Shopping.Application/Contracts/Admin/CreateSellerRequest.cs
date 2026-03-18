namespace Shopping.Application.Contracts.Admin;

public sealed class CreateSellerRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string StoreName { get; set; } = string.Empty;
}
