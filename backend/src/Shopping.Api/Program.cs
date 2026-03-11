using System;
using System.Linq;
using System.Text;
using System.Threading;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Shopping.Application.Contracts.Auth;
using Shopping.Application.Contracts.Products;
using Shopping.Application.Services;
using Shopping.Domain.Entities;
using Shopping.Domain.Enums;
using Shopping.Infrastructure.Data;
using Shopping.Infrastructure.Security;
using Shopping.Infrastructure.Services;


var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ??
                       throw new InvalidOperationException("Connection string is missing.");
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IImageStorageService, CloudinaryImageService>();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException("Jwt:Key is missing. Set Jwt:Key in appsettings or env Jwt__Key.");
}
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "ShoppingApi";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "ShoppingClient";
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = key
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("BuyerOnly", policy => policy.RequireRole(UserRole.Buyer.ToString(), UserRole.Admin.ToString()));
    options.AddPolicy("SellerOnly", policy => policy.RequireRole(UserRole.Seller.ToString(), UserRole.Admin.ToString()));
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("Frontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/api/v1/health", () => Results.Ok(new { status = "ok" }));

var auth = app.MapGroup("/api/v1/auth");
auth.MapPost("/login", async (LoginRequest request, IAuthService authService, CancellationToken ct) =>
{
    var result = await authService.LoginAsync(request, ct);
    if (!result.Succeeded)
    {
        return Results.BadRequest(result);
    }

    return Results.Ok(result);
});

auth.MapPost("/register", async (RegisterRequest request, IAuthService authService, CancellationToken ct) =>
{
    var result = await authService.RegisterAsync(request, ct);
    if (!result.Succeeded)
    {
        return Results.BadRequest(result);
    }

    return Results.Ok(result);
});

var products = app.MapGroup("/api/v1/products").RequireAuthorization();
products.MapGet("/", async (AppDbContext db, CancellationToken ct) =>
{
    var all = await db.Products
        .Include(x => x.Images)
        .Select(x => new
        {
            x.Id,
            x.Name,
            x.Description,
            x.Price,
            x.Stock,
            x.IsPublished,
            x.SellerId,
            Images = x.Images.Select(i => new { i.Url, i.PublicId }).ToList()
        })
        .ToListAsync(ct);

    return Results.Ok(all);
});

products.MapPost("/", [Authorize(Policy = "SellerOnly")] async (
    ProductCreateRequest request,
    AppDbContext db,
    HttpContext context,
    CancellationToken ct) =>
{
    var roleClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
    var emailClaim = context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;

    if (roleClaim is not "Seller" and not "Admin" || string.IsNullOrWhiteSpace(emailClaim))
    {
        return Results.Forbid();
    }

    var seller = await db.Users.FirstOrDefaultAsync(x => x.Email == emailClaim, ct);
    if (seller is null)
    {
        return Results.Unauthorized();
    }

    var product = new Product
    {
        Name = request.Name,
        Description = request.Description,
        Price = request.Price,
        Stock = request.Stock,
        SellerId = seller.Id
    };

    db.Products.Add(product);
    await db.SaveChangesAsync(ct);

    return Results.Created($"/api/v1/products/{product.Id}", product);
});

var images = app.MapGroup("/api/v1/products/{productId:int}/images").RequireAuthorization("SellerOnly");
images.MapPost("/", async (int productId, HttpContext context, AppDbContext db, IImageStorageService imageService, CancellationToken ct) =>
{
    var file = context.Request.Form.Files.FirstOrDefault();
    if (file is null || file.Length == 0)
    {
        return Results.BadRequest("Image file is required.");
    }

    var email = context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
    if (string.IsNullOrWhiteSpace(email))
    {
        return Results.Unauthorized();
    }

    var seller = await db.Users.FirstOrDefaultAsync(x => x.Email == email, ct);
    if (seller is null)
    {
        return Results.Unauthorized();
    }

    await using var stream = file.OpenReadStream();
    var result = await imageService.UploadProductImageAsync(stream, file.FileName, $"shop-products/{seller.Id}", ct);

    var image = new ProductImage
    {
        ProductId = productId,
        Url = result.url,
        PublicId = result.publicId
    };

    db.ProductImages.Add(image);
    await db.SaveChangesAsync(ct);

    return Results.Ok(new { image.Url, image.PublicId });
});

var orders = app.MapGroup("/api/v1/orders");
orders.MapPost("/buyer", [Authorize(Policy = "BuyerOnly")] async (HttpContext context, AppDbContext db, CancellationToken ct) =>
{
    var email = context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
    if (string.IsNullOrWhiteSpace(email))
    {
        return Results.Unauthorized();
    }

    var buyer = await db.Users.FirstOrDefaultAsync(x => x.Email == email, ct);
    if (buyer is null)
    {
        return Results.Unauthorized();
    }

    return Results.Ok(new { message = "Order flow placeholder", buyerId = buyer.Id });
});

orders.MapGet("/seller", [Authorize(Policy = "SellerOnly")] async (HttpContext context, AppDbContext db, CancellationToken ct) =>
{
    var email = context.User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value;
    if (string.IsNullOrWhiteSpace(email))
    {
        return Results.Unauthorized();
    }

    var seller = await db.Users.FirstOrDefaultAsync(x => x.Email == email, ct);
    if (seller is null)
    {
        return Results.Unauthorized();
    }

    var sellerOrders = await db.Orders
        .Where(o => db.OrderItems.Any(i => i.OrderId == o.Id && db.Products.Any(p => p.Id == i.ProductId && p.SellerId == seller.Id)))
        .Select(o => new { o.Id, o.TotalAmount, o.Status, o.CreatedAt })
        .ToListAsync(ct);

    return Results.Ok(sellerOrders);
});

app.Run();
