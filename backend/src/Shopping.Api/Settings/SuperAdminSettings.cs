namespace Shopping.Api.Settings;

public sealed class SuperAdminSettings
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string PublicUserId { get; set; } = "admin";
}
