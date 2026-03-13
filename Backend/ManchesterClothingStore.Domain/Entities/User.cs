using ManchesterClothingStore.Domain.Enums;

namespace ManchesterClothingStore.Domain.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Cliente;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiresAt { get; set; }

    // =========================
    // Relaciones
    // =========================

    // 1 usuario -> 1 carrito
    public Cart? Cart { get; set; }

    // 1 usuario -> muchas órdenes
    public List<Order> Orders { get; set; } = new();
}