using Microsoft.AspNetCore.Identity;
using Shopping.Domain.Enums;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shopping.Domain.Entities;

public sealed class User : IdentityUser<int>
{
    [MaxLength(50)]
    public string PublicUserId { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Seller;
    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = [];
    public ICollection<Order> Orders { get; set; } = [];
    public ICollection<CartItem> CartItems { get; set; } = [];
}
