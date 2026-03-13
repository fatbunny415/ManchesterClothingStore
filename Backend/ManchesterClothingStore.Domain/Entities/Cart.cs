namespace ManchesterClothingStore.Domain.Entities;

public class Cart
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // FK
    public Guid UserId { get; set; }

    // Navegación
    public User? User { get; set; }

    public List<CartItem> Items { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}