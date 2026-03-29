using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Infrastructure.Persistence;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("Token inválido: no se encontró el UserId.");
        return Guid.Parse(userIdClaim);
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid userId)
    {
        var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        cart.Items = await _context.CartItems.Where(i => i.CartId == cart.Id).ToListAsync();

        var productIds = cart.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);

        foreach (var item in cart.Items)
        {
            if (products.TryGetValue(item.ProductId, out var product))
                item.Product = product;
        }

        return cart;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserId();
        var cart = await GetOrCreateCartAsync(userId);

        var response = new
        {
            cart.Id,
            cart.UserId,
            cart.CreatedAt,
            Items = cart.Items.Select(i => new
            {
                i.Id,
                i.ProductId,
                ProductName = i.Product?.Name ?? "Producto Desconocido",
                i.Quantity,
                i.UnitPrice,
                Total = i.Quantity * i.UnitPrice
            }),
            TotalCart = cart.Items.Sum(i => i.Quantity * i.UnitPrice)
        };

        return Ok(response);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] AddCartItemDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest("La cantidad debe ser mayor a cero.");

        var userId = GetUserId();
        var cart = await GetOrCreateCartAsync(userId);

        var product = await _context.Products.FindAsync(dto.ProductId);
        if (product is null)
            return NotFound("Producto no encontrado.");

        if (!product.IsActive)
            return BadRequest("El producto no está disponible.");

        if (product.Stock < dto.Quantity)
            return BadRequest("No hay stock suficiente.");

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);

        if (existingItem is not null)
        {
            var newQuantity = existingItem.Quantity + dto.Quantity;
            if (product.Stock < newQuantity)
                return BadRequest("No hay stock suficiente para aumentar la cantidad.");

            existingItem.Quantity = newQuantity;
            existingItem.UnitPrice = product.Price;
        }
        else
        {
            var cartItem = new CartItem
            {
                CartId = cart.Id,
                ProductId = product.Id,
                Quantity = dto.Quantity,
                UnitPrice = product.Price
            };
            _context.CartItems.Add(cartItem);
        }

        await _context.SaveChangesAsync();
        return Ok("Producto agregado al carrito correctamente.");
    }

    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] UpdateCartItemDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest("La cantidad debe ser mayor a cero.");

        var userId = GetUserId();
        var cart = await GetOrCreateCartAsync(userId);

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
            return NotFound("Producto no encontrado en el carrito.");

        if (item.Product != null && item.Product.Stock < dto.Quantity)
            return BadRequest("No hay stock suficiente.");

        item.Quantity = dto.Quantity;
        item.UnitPrice = item.Product?.Price ?? item.UnitPrice;

        await _context.SaveChangesAsync();
        return Ok("Cantidad actualizada correctamente.");
    }

    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        var userId = GetUserId();
        var cart = await GetOrCreateCartAsync(userId);

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
            return NotFound("Producto no encontrado en el carrito.");

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();

        return Ok("Producto eliminado del carrito.");
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        var cart = await GetOrCreateCartAsync(userId);

        if (!cart.Items.Any())
            return BadRequest("El carrito ya está vacío.");

        _context.CartItems.RemoveRange(cart.Items);
        await _context.SaveChangesAsync();

        return Ok("Carrito vaciado correctamente.");
    }
}