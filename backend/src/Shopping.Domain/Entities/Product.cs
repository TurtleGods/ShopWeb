using System.ComponentModel.DataAnnotations;

namespace Shopping.Domain.Entities;

public sealed class Product : BaseEntity
{
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public int Stock { get; set; }
    public bool IsPublished { get; set; } = true;

    public int SellerId { get; set; }
    public User Seller { get; set; } = null!;

    public ICollection<ProductImage> Images { get; set; } = [];
    public ICollection<OrderItem> OrderItems { get; set; } = [];
}

