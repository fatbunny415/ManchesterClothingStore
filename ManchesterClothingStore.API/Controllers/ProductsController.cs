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
    public async Task<ActionResult<IEnumerable<Product>>> GetAll()
    {
        var products = await _context.Products.ToListAsync();
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
            new() { Name="Camiseta Negra", Description="Algodón premium", Price=45000, Stock=20, Category="Camisetas", ImageUrl="https://example.com/camiseta-negra.png", IsActive=true, CreatedAt=now },
            new() { Name="Camiseta Blanca", Description="Básica unisex", Price=40000, Stock=25, Category="Camisetas", ImageUrl="https://example.com/camiseta-blanca.png", IsActive=true, CreatedAt=now },
            new() { Name="Jean Slim", Description="Jean azul slim fit", Price=110000, Stock=15, Category="Pantalones", ImageUrl="https://example.com/jean-slim.png", IsActive=true, CreatedAt=now },
            new() { Name="Chaqueta Denim", Description="Chaqueta clásica", Price=160000, Stock=10, Category="Chaquetas", ImageUrl="https://example.com/chaqueta-denim.png", IsActive=true, CreatedAt=now },
            new() { Name="Hoodie Gris", Description="Buzo con capota", Price=95000, Stock=18, Category="Buzos", ImageUrl="https://example.com/hoodie-gris.png", IsActive=true, CreatedAt=now },
            new() { Name="Gorra Negra", Description="Gorra ajustable", Price=35000, Stock=30, Category="Accesorios", ImageUrl="https://example.com/gorra-negra.png", IsActive=true, CreatedAt=now },
            new() { Name="Tenis Urban", Description="Tenis estilo urbano", Price=180000, Stock=12, Category="Calzado", ImageUrl="https://example.com/tenis-urban.png", IsActive=true, CreatedAt=now },
            new() { Name="Camisa Formal", Description="Camisa manga larga", Price=120000, Stock=14, Category="Camisas", ImageUrl="https://example.com/camisa-formal.png", IsActive=true, CreatedAt=now },
            new() { Name="Polo Azul", Description="Polo casual", Price=65000, Stock=22, Category="Polos", ImageUrl="https://example.com/polo-azul.png", IsActive=true, CreatedAt=now },
            new() { Name="Short Deportivo", Description="Short liviano", Price=55000, Stock=19, Category="Deportiva", ImageUrl="https://example.com/short-deportivo.png", IsActive=true, CreatedAt=now }
        };

        _context.Products.AddRange(products);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Productos de demo creados.", total = products.Count });
    }
}