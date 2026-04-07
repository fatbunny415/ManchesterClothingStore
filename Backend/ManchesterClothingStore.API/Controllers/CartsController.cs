using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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
    private readonly AppDbContext _context;

    public CartsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/carts
    [HttpGet]
    public async Task<ActionResult<Cart>> GetMyCart()
    {
        var userId = GetUserId();
        var cart = await _context.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return Ok(ProjectCart(cart));
    }

    // POST: api/carts/items
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto)
    {
        if (dto.Quantity <= 0)
            return BadRequest("La cantidad debe ser mayor a cero.");

        var userId = GetUserId();
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId };
            _context.Carts.Add(cart);
        }

        var product = await _context.Products.FindAsync(dto.ProductId);
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

        await _context.SaveChangesAsync();

        // Recargar con Product para proyección
        await _context.Entry(cart).Collection(c => c.Items).Query()
            .Include(i => i.Product)
            .LoadAsync();

        return Ok(ProjectCart(cart));
    }

    // PUT: api/carts/items/{id}
    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, UpdateCartItemDto dto)
    {
        var item = await _context.CartItems
            .Include(i => i.Cart)
            .Include(i => i.Product)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart.UserId == GetUserId());

        if (item == null) return NotFound("Item no encontrado en tu carrito.");

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            if (item.Product.Stock < dto.Quantity)
                return BadRequest("No hay stock suficiente.");

            item.Quantity = dto.Quantity;
            item.UnitPrice = item.Product.Price;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/carts/items/{id}
    [HttpDelete("items/{itemId:guid}")]
    public async Task<IActionResult> RemoveItem(Guid itemId)
    {
        var item = await _context.CartItems
            .Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart.UserId == GetUserId());

        if (item == null) return NotFound("Item no encontrado.");

        _context.CartItems.Remove(item);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/carts
    [HttpDelete]
    public async Task<IActionResult> ClearCart()
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == GetUserId());

        if (cart != null)
        {
            _context.CartItems.RemoveRange(cart.Items);
            await _context.SaveChangesAsync();
        }

        return NoContent();
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(idClaim!);
    }

    private static object ProjectCart(Cart cart) => new
    {
        cart.Id,
        cart.UserId,
        cart.CreatedAt,
        Items = cart.Items.Select(i => new
        {
            i.Id,
            i.ProductId,
            i.Quantity,
            i.UnitPrice,
            i.LineTotal,
            Product = i.Product == null ? null : new
            {
                i.Product.Id,
                i.Product.Name,
                i.Product.ImageUrl,
                i.Product.Price,
                i.Product.Stock
            }
        }),
        Total = cart.Items.Sum(i => i.LineTotal)
    };
}
