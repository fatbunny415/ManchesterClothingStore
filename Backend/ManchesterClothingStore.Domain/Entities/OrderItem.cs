namespace ManchesterClothingStore.Domain.Entities;

public class OrderItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; } = 1;

    public decimal UnitPrice { get; set; } = 0;

    // No se guarda en DB: solo para mostrar subtotal por línea
    public decimal LineTotal => UnitPrice * Quantity;
}