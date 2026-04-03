using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Infrastructure.Persistence;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
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
        var query = _context.Products.AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(p => p.Category == category);

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(p => p.Name.Contains(search) || p.Description.Contains(search));

        if (active.HasValue)
            query = query.Where(p => p.IsActive == active.Value);

        var products = await query.ToListAsync();
        return Ok(products);
    }

    // =========================
    // GET: api/products/{id}
    // Público
    // =========================
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Product>> GetById(Guid id)
    {
        var product = await _context.Products.FindAsync(id);

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
            IsActive = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    // =========================
    // PUT: api/products/{id}
    // Admin o Vendedor
    // =========================
    [Authorize(Roles = "Admin,Vendedor")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateProductDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var product = await _context.Products.FindAsync(id);
        if (product is null)
            return NotFound("Producto no encontrado.");

        product.Name = dto.Name;
        product.Description = dto.Description;
        product.Price = dto.Price;
        product.Stock = dto.Stock;
        product.Category = dto.Category;
        product.ImageUrl = dto.ImageUrl;
        product.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // =========================
    // DELETE: api/products/{id}
    // Solo Admin
    // =========================
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var product = await _context.Products.FindAsync(id);

        if (product is null)
            return NotFound("Producto no encontrado.");

        _context.Products.Remove(product);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // =========================
    // POST: api/products/seed
    // Solo Admin - Carga demo
    // =========================
    [Authorize(Roles = "Admin")]
    [HttpPost("seed")]
    public async Task<IActionResult> Seed()
    {
        if (await _context.Products.AnyAsync())
            return BadRequest("Ya existen productos en la base de datos.");

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

        _context.Products.AddRange(products);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Productos de demo creados.", total = products.Count });
    }
}