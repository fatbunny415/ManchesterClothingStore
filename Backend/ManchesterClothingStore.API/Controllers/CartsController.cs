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

        return Ok(cart);
    }

    // POST: api/carts/items
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddCartItemDto dto)
    {
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

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);
        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
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
        return Ok(cart);
    }

    // PUT: api/carts/items/{id}
    [HttpPut("items/{itemId:guid}")]
    public async Task<IActionResult> UpdateItem(Guid itemId, UpdateCartItemDto dto)
    {
        var item = await _context.CartItems
            .Include(i => i.Cart)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart.UserId == GetUserId());

        if (item == null) return NotFound("Item no encontrado en tu carrito.");

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = dto.Quantity;
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
}
