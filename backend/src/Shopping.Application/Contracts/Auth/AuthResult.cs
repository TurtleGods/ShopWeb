namespace Shopping.Application.Contracts.Auth;

public sealed class AuthResult
{
    public bool Succeeded { get; init; }
    public string? Message { get; init; }
    public string? Token { get; init; }
    public string? Email { get; init; }
    public string? Role { get; init; }
    public string? PublicUserId { get; init; }

    public static AuthResult Success(string token, string email, string role, string publicUserId) => new()
    {
        Succeeded = true,
        Token = token,
        Email = email,
        Role = role,
        PublicUserId = publicUserId
    };

    public static AuthResult Fail(string message) => new() { Succeeded = false, Message = message };
}
