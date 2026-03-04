using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Infrastructure.Persistence;
using System.Security.Claims;

namespace ManchesterClothingStore.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/orders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Order>>> GetMyOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .Where(o => o.UserId == GetUserId())
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders);
    }

    // GET: api/orders/{id}
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<Order>> GetById(Guid id)
    {
        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == GetUserId());

        if (order == null) return NotFound();

        return Ok(order);
    }

    // POST: api/orders
    // Convierte el carrito actual en una orden
    [HttpPost]
    public async Task<IActionResult> CreateOrder()
    {
        var userId = GetUserId();
        var cart = await _context.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.Items.Any())
            return BadRequest("El carrito está vacío.");

        var order = new Order
        {
            UserId = userId,
            CreatedAt = DateTime.UtcNow,
            TotalAmount = cart.Items.Sum(i => i.UnitPrice * i.Quantity),
            Items = cart.Items.Select(i => new OrderItem
            {
                ProductId = i.ProductId,
                Quantity = i.Quantity,
                UnitPrice = i.UnitPrice
            }).ToList()
        };

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.Items); // Limpiar carrito
        
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
    }

    private Guid GetUserId()
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.Parse(idClaim!);
    }
}
