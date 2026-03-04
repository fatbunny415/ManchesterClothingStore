namespace ManchesterClothingStore.Domain.Entities;

public class CartItem
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    public int Quantity { get; set; } = 1;

    public decimal UnitPrice { get; set; } = 0;

    // No se guarda en DB: solo para calcular total del item
    public decimal LineTotal => UnitPrice * Quantity;
}