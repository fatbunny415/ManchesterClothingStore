using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Infrastructure.Persistence;
using System.Security.Claims;

namespace ManchesterClothingStore.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class CartsController : ControllerBase
{
    private readonly MongoDbContext _db;

    public CartsController(MongoDbContext db)
    {
        _db = db;
    }

    private string GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(idClaim))
            throw new UnauthorizedAccessException();
        return idClaim;
    }

    // GET: api/carts
    [HttpGet]
    public async Task<IActionResult> GetMyCart()
    {
        var userId = GetUserId();
        var cart = await _db.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();

        if (cart == null)
            return Ok(new { Items = new List<object>(), Total = 0 });

        return Ok(await ProjectCartAsync(cart));
    }

    // POST: api/carts/items
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest("La cantidad debe ser mayor a cero.");

        var userId = GetUserId();
        var cart = await _db.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            await _db.Carts.InsertOneAsync(cart);
        }

        var product = await _db.Products.Find(p => p.Id == dto.ProductId).FirstOrDefaultAsync();
        if (product == null) return NotFound("Producto no encontrado.");

        if (!product.IsActive)
            return BadRequest("El producto no está disponible.");

        if (product.Stock < dto.Quantity)
            return BadRequest("No hay stock suficiente.");

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + dto.Quantity;

            if (product.Stock < newQuantity)
                return BadRequest("No hay stock suficiente para aumentar la cantidad.");

            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = product.Price;
        }
        else
        {
            cart.Items.Add(new CartItem
            {
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                UnitPrice = product.Price
            });
        }

        await _db.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);

        return Ok(await ProjectCartAsync(cart));
    }

    // PUT: api/carts/items/{id}
    [HttpPut("items/{itemId}")]
    public async Task<IActionResult> UpdateItem(string itemId, UpdateCartItemDto dto)
    {
        var userId = GetUserId();
        var cart = await _db.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();

        if (cart == null) return NotFound("Carrito no encontrado.");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null) return NotFound("Item no encontrado en tu carrito.");

        if (dto.Quantity <= 0)
        {
            cart.Items.Remove(item);
        }
        else
        {
            var product = await _db.Products.Find(p => p.Id == item.ProductId).FirstOrDefaultAsync();
            if (product == null || product.Stock < dto.Quantity)
                return BadRequest("No hay stock suficiente.");

            item.Quantity = dto.Quantity;
            item.UnitPrice = product.Price;
        }

        await _db.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        return NoContent();
    }

    // DELETE: api/carts/items/{id}
    [HttpDelete("items/{itemId}")]
    public async Task<IActionResult> RemoveItem(string itemId)
    {
        var userId = GetUserId();
        var cart = await _db.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();

        if (cart == null) return NotFound("Carrito no encontrado.");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item == null) return NotFound("Item no encontrado.");

        cart.Items.Remove(item);
        await _db.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);

        return NoContent();
    }

    // DELETE: api/carts
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        var cart = await _db.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();

        if (cart != null)
        {
            cart.Items.Clear();
            await _db.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);
        }

        return NoContent();
    }

    private async Task<object> ProjectCartAsync(Cart cart)
    {
        var productIds = cart.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products.Find(p => productIds.Contains(p.Id)).ToListAsync();
        var productDict = products.ToDictionary(p => p.Id);

        return new
        {
            cart.Id,
            cart.UserId,
            cart.CreatedAt,
            Items = cart.Items.Select(i => 
            {
                var product = productDict.GetValueOrDefault(i.ProductId);
                return new
                {
                    i.Id,
                    i.ProductId,
                    i.Quantity,
                    i.UnitPrice,
                    i.LineTotal,
                    Product = product == null ? null : new
                    {
                        product.Id,
                        product.Name,
                        product.ImageUrl,
                        product.Price,
                        product.Stock
                    }
                };
            }),
            Total = cart.Items.Sum(i => i.LineTotal)
        };
    }
}
