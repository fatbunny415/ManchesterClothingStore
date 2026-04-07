using Microsoft.Extensions.Options;
using MongoDB.Driver;
using ManchesterClothingStore.Domain.Entities;

namespace ManchesterClothingStore.Infrastructure.Persistence;

public class MongoDbContext
{
    private readonly IMongoDatabase _database;

    public MongoDbContext(IOptions<MongoDbSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        _database = client.GetDatabase(settings.Value.DatabaseName);
    }

    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
    public IMongoCollection<Product> Products => _database.GetCollection<Product>("Products");
    public IMongoCollection<Cart> Carts => _database.GetCollection<Cart>("Carts");
    public IMongoCollection<Order> Orders => _database.GetCollection<Order>("Orders");

    /// <summary>
    /// Crea índices necesarios para rendimiento.
    /// Llamar una vez al iniciar la aplicación.
    /// </summary>
    public async Task EnsureIndexesAsync()
    {
        // Índice único en Email de usuario
        await Users.Indexes.CreateOneAsync(
            new CreateIndexModel<User>(
                Builders<User>.IndexKeys.Ascending(u => u.Email),
                new CreateIndexOptions { Unique = true }
            )
        );

        // Índice único en UserId del carrito (1 carrito por usuario)
        await Carts.Indexes.CreateOneAsync(
            new CreateIndexModel<Cart>(
                Builders<Cart>.IndexKeys.Ascending(c => c.UserId),
                new CreateIndexOptions { Unique = true }
            )
        );

        // Índice en UserId de órdenes
        await Orders.Indexes.CreateOneAsync(
            new CreateIndexModel<Order>(
                Builders<Order>.IndexKeys.Ascending(o => o.UserId)
            )
        );

        // Índice compuesto en productos: Category + IsActive
        await Products.Indexes.CreateOneAsync(
            new CreateIndexModel<Product>(
                Builders<Product>.IndexKeys
                    .Ascending(p => p.Category)
                    .Ascending(p => p.IsActive)
            )
        );
    }
}
