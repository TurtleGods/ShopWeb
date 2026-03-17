using System.Threading;
using System.Threading.Tasks;
using Shopping.Domain.Entities;

namespace Shopping.Infrastructure.Interfaces;

public interface IJwtTokenService
{
    Task<string> CreateTokenAsync(User user, CancellationToken ct = default);
}
