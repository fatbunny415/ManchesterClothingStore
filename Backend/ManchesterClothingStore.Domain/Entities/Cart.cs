using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ManchesterClothingStore.Domain.Entities;

public class Cart
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = string.Empty;

    public string UserId { get; set; } = string.Empty;

    public List<CartItem> Items { get; set; } = new();

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}