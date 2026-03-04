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
}