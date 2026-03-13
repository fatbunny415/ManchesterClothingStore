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

    // =========================
    // Helper: obtener UserId desde JWT
    // =========================
    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("Token inválido: no se encontró el UserId.");

        return Guid.Parse(userIdClaim);
    }

    // =========================
    // Helper: obtener o crear carrito
    // =========================
    private async Task<Cart> GetOrCreateCartAsync(Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is not null)
            return cart;

        var newCart = new Cart
        {
            UserId = userId
        };

        _context.Carts.Add(newCart);
        await _context.SaveChangesAsync();

        return await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstAsync(c => c.UserId == userId);
    }

    // =========================
    // GET: api/cart
    // Ver carrito del usuario autenticado
    // =========================
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
                ProductName = i.Product.Name,
                i.Quantity,
                i.UnitPrice,
                Total = i.Quantity * i.UnitPrice
            }),
            TotalCart = cart.Items.Sum(i => i.Quantity * i.UnitPrice)
        };

        return Ok(response);
    }

    // =========================
    // POST: api/cart/items
    // Agregar producto al carrito
    // =========================
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

    // =========================
    // PUT: api/cart/items/{itemId}
    // Actualizar cantidad de un item
    // =========================
    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, [FromBody] UpdateCartItemDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest("La cantidad debe ser mayor a cero.");

        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null)
            return NotFound("Carrito no encontrado.");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
            return NotFound("Producto no encontrado en el carrito.");

        if (item.Product.Stock < dto.Quantity)
            return BadRequest("No hay stock suficiente.");

        item.Quantity = dto.Quantity;
        item.UnitPrice = item.Product.Price;

        await _context.SaveChangesAsync();

        return Ok("Cantidad actualizada correctamente.");
    }

    // =========================
    // DELETE: api/cart/items/{itemId}
    // Eliminar item del carrito
    // =========================
    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null)
            return NotFound("Carrito no encontrado.");

        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null)
            return NotFound("Producto no encontrado en el carrito.");

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();

        return Ok("Producto eliminado del carrito.");
    }

    // =========================
    // DELETE: api/cart/clear
    // Vaciar carrito completo
    // =========================
    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart is null || !cart.Items.Any())
            return BadRequest("El carrito ya está vacío.");

        _context.CartItems.RemoveRange(cart.Items);
        await _context.SaveChangesAsync();

        return Ok("Carrito vaciado correctamente.");
    }
}