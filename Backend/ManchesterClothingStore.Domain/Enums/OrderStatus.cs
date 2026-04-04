namespace ManchesterClothingStore.Domain.Enums;

public enum OrderStatus
{
    Pending = 1,      // Pendiente
    Paid = 2,         // Pagado / Confirmado
    Processing = 3,   // En Preparación
    Shipped = 4,      // Enviado
    Delivered = 5,    // Entregado
    Cancelled = 6     // Cancelado
}