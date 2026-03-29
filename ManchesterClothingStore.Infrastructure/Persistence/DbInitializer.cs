using ManchesterClothingStore.Domain.Entities;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Linq;

namespace ManchesterClothingStore.Infrastructure.Persistence;

public static class DbInitializer
{
    public static void Initialize(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Nos aseguramos de que la base de datos y las colecciones se creen
        context.Database.EnsureCreated();

        // Si ya hay categorías, asumimos que ya corrió el seed
        if (context.Categories.Any())
        {
            return;
        }

        var catMen = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Ropa de Hombre",
            Description = "Ropa elegante y casual para hombre"
        };
        
        var catWomen = new Category
        {
            Id = Guid.NewGuid(),
            Name = "Ropa de Mujer",
            Description = "Colección exclusiva para mujer"
        };

        context.Categories.AddRange(catMen, catWomen);

        var products = new[]
        {
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Camiseta Básica M",
                Description = "Camiseta de algodón 100% color gris",
                Price = 15.99m,
                Stock = 100,
                CategoryId = catMen.Id
            },
            new Product
            {
                Id = Guid.NewGuid(),
                Name = "Pantalón Denim Ajustado",
                Description = "Jeans cómodos de uso diario",
                Price = 45.50m,
                Stock = 50,
                CategoryId = catWomen.Id
            }
        };

        context.Products.AddRange(products);
        context.SaveChanges();
    }
}
