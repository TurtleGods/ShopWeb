using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
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
        var cloudName = configuration["Cloudinary:CloudName"];
        var apiKey = configuration["Cloudinary:ApiKey"];
        var apiSecret = configuration["Cloudinary:ApiSecret"];

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
            Transformation = new Transformation().Width(1600).Height(1600).Crop("limit").Quality("auto").FetchFormat("auto"),
            Folder = string.IsNullOrWhiteSpace(prefix) ? "shop-products" : prefix
        };

        var uploadResult = await _cloudinary.UploadAsync(parameters, ct);

        if (uploadResult?.SecureUrl == null)
        {
            throw new InvalidOperationException("Cloudinary upload failed.");
        }

        return (uploadResult.SecureUrl.ToString(), uploadResult.PublicId ?? string.Empty);
    }

    public async Task DeleteProductImageAsync(string publicId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(publicId))
        {
            return;
        }

        var deleteResult = await _cloudinary.DestroyAsync(new DeletionParams(publicId)
        {
            ResourceType = ResourceType.Image
        });

        if (deleteResult is null)
        {
            throw new InvalidOperationException("Cloudinary delete failed.");
        }

        var result = deleteResult.Result ?? string.Empty;
        if (!string.Equals(result, "ok", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(result, "not found", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException($"Cloudinary delete failed: {result}");
        }
    }
}

