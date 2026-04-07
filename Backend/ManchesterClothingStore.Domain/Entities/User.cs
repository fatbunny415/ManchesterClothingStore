using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using ManchesterClothingStore.Domain.Enums;

namespace ManchesterClothingStore.Domain.Entities;

public class User
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;

    // Campos de Perfil de Usuario Adicionales
    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }

    [BsonRepresentation(BsonType.String)]
    public UserRole Role { get; set; } = UserRole.Cliente;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public string? PasswordResetToken { get; set; }
    public DateTime? PasswordResetTokenExpiresAt { get; set; }

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
}