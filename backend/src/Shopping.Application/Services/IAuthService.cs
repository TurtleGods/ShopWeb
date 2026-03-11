using Shopping.Application.Contracts.Auth;
using System.Threading;
using System.Threading.Tasks;

namespace Shopping.Application.Services;

public interface IAuthService
{
    Task<AuthResult> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken ct = default);
}

