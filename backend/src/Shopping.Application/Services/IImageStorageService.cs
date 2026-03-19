using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace Shopping.Application.Services;

public interface IImageStorageService
{
    Task<(string url, string publicId)> UploadProductImageAsync(Stream fileStream, string fileName, string? prefix = null, CancellationToken ct = default);
    Task DeleteProductImageAsync(string publicId, CancellationToken ct = default);
}
