using Microsoft.EntityFrameworkCore;
using MongoDB.EntityFrameworkCore.Extensions;
using ManchesterClothingStore.Domain.Entities;

namespace ManchesterClothingStore.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) 
    { 
        // Deshabilitar transacciones porque MongoDB local (standalone) no las soporta por defecto
        Database.AutoTransactionBehavior = AutoTransactionBehavior.Never;
    }

    // =========================
    // DbSets
    // =========================
    public DbSet<User> Users => Set<User>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();

    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================
        // MongoDB Collections Mapping
        // =========================
        modelBuilder.Entity<User>().ToCollection("Users");
        modelBuilder.Entity<Category>().ToCollection("Categories");
        modelBuilder.Entity<Product>().ToCollection("Products");
        modelBuilder.Entity<Cart>().ToCollection("Carts");
        modelBuilder.Entity<CartItem>().ToCollection("CartItems");
        modelBuilder.Entity<Order>().ToCollection("Orders");
        modelBuilder.Entity<OrderItem>().ToCollection("OrderItems");
    }
}