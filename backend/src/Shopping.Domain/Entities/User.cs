using Microsoft.AspNetCore.Identity;
using Shopping.Domain.Enums;
using System.Collections.Generic;

namespace Shopping.Domain.Entities;

public sealed class User : IdentityUser<int>
{
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Buyer;
    public string? StoreName { get; set; }
    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<CartItem> CartItems { get; set; } = [];
}
