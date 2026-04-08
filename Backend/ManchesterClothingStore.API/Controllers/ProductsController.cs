using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Infrastructure.Persistence;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly MongoDbContext _db;

    public ProductsController(MongoDbContext db)
    {
        _db = db;
    }

    // =========================
    // GET: api/products
    // Público
    // =========================
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetAll(
        [FromQuery] string? category = null,
        [FromQuery] string? search = null,
        [FromQuery] bool? active = null)
    {
        var builder = Builders<Product>.Filter;
        var filter = builder.Empty;

        if (!string.IsNullOrWhiteSpace(category))
            filter &= builder.Eq(p => p.Category, category);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var escapedSearch = System.Text.RegularExpressions.Regex.Escape(search);
            var searchFilter = builder.Regex(p => p.Name, new MongoDB.Bson.BsonRegularExpression(escapedSearch, "i")) |
                               builder.Regex(p => p.Description, new MongoDB.Bson.BsonRegularExpression(escapedSearch, "i"));
            filter &= searchFilter;
        }

        if (active.HasValue)
            filter &= builder.Eq(p => p.IsActive, active.Value);

        var products = await _db.Products.Find(filter).ToListAsync();
        return Ok(products);
    }

    // =========================
    // GET: api/products/{id}
    // Público
    // =========================
    [HttpGet("{id}")]
    public async Task<ActionResult<Product>> GetById(string id)
    {
        var product = await _db.Products.Find(p => p.Id == id).FirstOrDefaultAsync();

        if (product is null)
            return NotFound("Producto no encontrado.");

        return Ok(product);
    }

    // =========================
    // POST: api/products
    // Admin o Vendedor
    // =========================
    [Authorize(Roles = "Admin,Vendedor")]
    [HttpPost]
    public async Task<ActionResult<Product>> Create([FromBody] CreateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = new Product
        {
            Name = dto.Name,
            Description = dto.Description,
            Price = dto.Price,
            Stock = dto.Stock,
            Category = dto.Category,
            ImageUrl = dto.ImageUrl,
            Sizes = dto.Sizes,
            Colors = dto.Colors,
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        await _db.Products.InsertOneAsync(product);

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    // =========================
    // PUT: api/products/{id}
    // Admin o Vendedor
    // =========================
    [Authorize(Roles = "Admin,Vendedor")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = await _db.Products.Find(p => p.Id == id).FirstOrDefaultAsync();
        if (product is null)
            return NotFound("Producto no encontrado.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.Category = dto.Category;
        product.ImageUrl = dto.ImageUrl;
        product.Sizes = dto.Sizes;
        product.Colors = dto.Colors;
        product.IsActive = dto.IsActive;

        await _db.Products.ReplaceOneAsync(p => p.Id == id, product);
        
        return NoContent();
    }

    // =========================
    // DELETE: api/products/{id}
    // Solo Admin
    // =========================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var product = await _db.Products.Find(p => p.Id == id).FirstOrDefaultAsync();

        if (product is null)
            return NotFound("Producto no encontrado.");

        await _db.Products.DeleteOneAsync(p => p.Id == id);
        return NoContent();
    }

    // =========================
    // POST: api/products/seed
    // Solo Admin - Carga demo
    // =========================
    [Authorize(Roles = "Admin")]
    [HttpPost("seed")]
    public async Task<IActionResult> Seed([FromQuery] bool force = false)
    {
        if (!force && await _db.Products.Find(_ => true).AnyAsync())
            return BadRequest("Ya existen productos en la base de datos. Usa ?force=true para reiniciar.");

        if (force)
            await _db.Products.DeleteManyAsync(_ => true);

        var now = DateTime.UtcNow;

        var products = new List<Product>
        {
            new() { Name="Camiseta Negra", Description="Algodón premium", Price=45000, Stock=20, Category="Camisetas", ImageUrl="https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80", Sizes="S,M,L,XL", Colors="Negro", IsActive=true, CreatedAt=now },
            new() { Name="Camiseta Blanca", Description="Básica unisex", Price=40000, Stock=25, Category="Camisetas", ImageUrl="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80", Sizes="XS,S,M,L", Colors="Blanco", IsActive=true, CreatedAt=now },
            new() { Name="Jean Slim", Description="Jean azul slim fit", Price=110000, Stock=15, Category="Pantalones", ImageUrl="https://images.unsplash.com/photo-1542272604-780c8d197607?w=800&q=80", Sizes="S,M,L", Colors="Azul", IsActive=true, CreatedAt=now },
            new() { Name="Chaqueta Denim", Description="Chaqueta clásica experta", Price=160000, Stock=10, Category="Chaquetas", ImageUrl="https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80", Sizes="M,L,XL", Colors="Azul", IsActive=true, CreatedAt=now },
            new() { Name="Hoodie Gris", Description="Buzo con capota", Price=95000, Stock=18, Category="Buzos", ImageUrl="https://images.unsplash.com/photo-1556821840-083b4822ff95?w=800&q=80", Sizes="S,M,L,XL", Colors="Gris", IsActive=true, CreatedAt=now },
            new() { Name="Gorra Negra", Description="Gorra ajustable premium", Price=35000, Stock=30, Category="Gorras", ImageUrl="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80", Sizes="M,L", Colors="Negro", IsActive=true, CreatedAt=now },
            new() { Name="Sudadera Negra", Description="Sudadera básica deportiva", Price=85000, Stock=12, Category="Sudaderas", ImageUrl="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&q=80", Sizes="S,M,L", Colors="Negro", IsActive=true, CreatedAt=now },
            new() { Name="Camisa Formal", Description="Camisa manga larga", Price=120000, Stock=14, Category="Camisas", ImageUrl="https://images.unsplash.com/photo-1593998066526-65fcab3021a2?w=800&q=80", Sizes="M,L,XL", Colors="Blanco", IsActive=true, CreatedAt=now },
            new() { Name="Polo Azul", Description="Polo casual texturizado", Price=65000, Stock=22, Category="Polos", ImageUrl="https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&q=80", Sizes="S,M,L", Colors="Azul", IsActive=true, CreatedAt=now },
            new() { Name="Short Deportivo", Description="Short liviano transpirable", Price=55000, Stock=19, Category="Deportiva", ImageUrl="https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80", Sizes="S,M,L,XL", Colors="Negro", IsActive=true, CreatedAt=now }
        };

        await _db.Products.InsertManyAsync(products);

        return Ok(new { message = "Productos de demo creados.", total = products.Count, force = force });
    }
}