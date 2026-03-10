namespace Shopping.Domain.Entities;

public sealed class Cart : BaseEntity
{
    public int BuyerId { get; set; }
    public User Buyer { get; set; } = null!;
    public ICollection<CartItem> Items { get; set; } = [];
}

