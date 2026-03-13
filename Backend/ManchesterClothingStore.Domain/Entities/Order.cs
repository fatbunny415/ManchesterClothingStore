using ManchesterClothingStore.Domain.Enums;

namespace ManchesterClothingStore.Domain.Entities;

public class Order
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // FK
    public Guid UserId { get; set; }

    // Navegación
    public User? User { get; set; }

    public OrderStatus Status { get; set; } = OrderStatus.Pending;

    // Items de la orden
    public List<OrderItem> Items { get; set; } = new();

    // Total calculado/guardado (para demo es perfecto guardarlo)
    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}