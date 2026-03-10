using System.IO;

namespace Shopping.Application.Services;

public interface IImageStorageService
{
    Task<(string url, string publicId)> UploadProductImageAsync(Stream fileStream, string fileName, string? prefix = null, CancellationToken ct = default);
}

