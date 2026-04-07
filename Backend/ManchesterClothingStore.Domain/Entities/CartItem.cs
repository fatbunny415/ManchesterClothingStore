using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace ManchesterClothingStore.Domain.Entities;

public class CartItem
{
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = ObjectId.GenerateNewId().ToString();

    public string ProductId { get; set; } = string.Empty;

    public int Quantity { get; set; } = 1;

    public decimal UnitPrice { get; set; } = 0;

    [BsonIgnore]
    public decimal LineTotal => UnitPrice * Quantity;
}