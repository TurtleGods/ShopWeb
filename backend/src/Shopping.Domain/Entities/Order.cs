using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Shopping.Domain.Entities;

public enum OrderStatus
{
    Created = 0,
    Paid = 1,
    Shipped = 2,
    Completed = 3,
    Cancelled = 4
}

public sealed class Order : BaseEntity
{
    public int BuyerId { get; set; }
    public User Buyer { get; set; } = null!;

    [MaxLength(40)]
    public string Status { get; set; } = OrderStatus.Created.ToString();

    public decimal TotalAmount { get; set; }
    public ICollection<OrderItem> Items { get; set; } = [];
}

