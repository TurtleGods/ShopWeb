using System.IO;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
using Shopping.Application.Services;

namespace Shopping.Infrastructure.Services;

public sealed class CloudinaryImageService : IImageStorageService
{
    private readonly Cloudinary _cloudinary;

    public CloudinaryImageService(IConfiguration configuration)
    {
        var cloudName = configuration["CLOUDINARY_CLOUD_NAME"];
        var apiKey = configuration["CLOUDINARY_API_KEY"];
        var apiSecret = configuration["CLOUDINARY_API_SECRET"];

        if (string.IsNullOrWhiteSpace(cloudName) || string.IsNullOrWhiteSpace(apiKey) || string.IsNullOrWhiteSpace(apiSecret))
        {
            throw new InvalidOperationException("Cloudinary environment variables are not configured.");
        }

        var account = new Account(cloudName, apiKey, apiSecret);
        _cloudinary = new Cloudinary(account);
    }

    public async Task<(string url, string publicId)> UploadProductImageAsync(
        Stream fileStream,
        string fileName,
        string? prefix = null,
        CancellationToken ct = default)
    {
        var parameters = new ImageUploadParams
        {
            File = new FileDescription(fileName, fileStream),
            Folder = string.IsNullOrWhiteSpace(prefix) ? "shop-products" : prefix
        };

        var uploadResult = await _cloudinary.UploadAsync(parameters, ct);

        if (uploadResult?.SecureUrl == null)
        {
            throw new InvalidOperationException("Cloudinary upload failed.");
        }

        return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId ?? string.Empty);
    }
}

