using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System.Security.Claims;

using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Domain.Enums;
using ManchesterClothingStore.Infrastructure.Persistence;
using ManchesterClothingStore.Application.Interfaces;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public OrdersController(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("Token inválido.");

        return Guid.Parse(userIdClaim);
    }

    // =========================
    // POST: api/orders/checkout
    // Crear orden desde carrito
    // =========================
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        var userId = GetUserId();

        var cart = await _context.Carts
            .Include(c => c.User)
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == userId);

        if (cart == null || !cart.Items.Any())
            return BadRequest("El carrito está vacío.");

        foreach (var item in cart.Items)
        {
            if (item.Product.Stock < item.Quantity)
                return BadRequest($"Stock insuficiente para {item.Product.Name}");
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in cart.Items)
        {
            item.Product.Stock -= item.Quantity;

            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        _context.Orders.Add(order);
        _context.CartItems.RemoveRange(cart.Items);

        await _context.SaveChangesAsync();

        // Enviar email simulado
        if (cart.User != null)
        {
            await _emailService.SendOrderConfirmationEmailAsync(
                cart.User.Email, 
                cart.User.FullName, 
                order.Id.ToString(), 
                order.TotalAmount
            );
        }

        return Ok(new
        {
            message = "Orden creada correctamente.",
            orderId = order.Id,
            total = order.TotalAmount,
            status = order.Status.ToString()
        });
    }

    // =========================
    // GET: api/orders/my-orders
    // Ver mis pedidos
    // =========================
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();

        var orders = await _context.Orders
            .Where(o => o.UserId == userId)
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                Status = o.Status.ToString(),
                o.TotalAmount,
                o.CreatedAt,
                Items = o.Items.Select(i => new
                {
                    i.ProductId,
                    ProductName = i.Product.Name,
                    ProductImageUrl = i.Product.ImageUrl,
                    i.Quantity,
                    i.UnitPrice,
                    LineTotal = i.Quantity * i.UnitPrice
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    // =========================
    // GET: api/orders/{id}
    // Ver detalle de una orden propia
    // =========================
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var userId = GetUserId();

        var order = await _context.Orders
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

        if (order == null)
            return NotFound("Orden no encontrada.");

        return Ok(new
        {
            order.Id,
            Status = order.Status.ToString(),
            order.TotalAmount,
            order.CreatedAt,
            Items = order.Items.Select(i => new
            {
                i.ProductId,
                ProductName = i.Product.Name,
                ProductImageUrl = i.Product.ImageUrl,
                i.Quantity,
                i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice
            })
        });
    }

    // =========================
    // GET: api/orders
    // Admin/Vendedor: ver todas las órdenes
    // =========================
    [Authorize(Roles = "Admin,Vendedor")]
    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var orders = await _context.Orders
            .Include(o => o.User)
            .Include(o => o.Items)
            .ThenInclude(i => i.Product)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => new
            {
                o.Id,
                o.UserId,
                CustomerName = o.User != null ? o.User.FullName : "Sin nombre",
                CustomerEmail = o.User != null ? o.User.Email : "Sin correo",
                Status = o.Status.ToString(),
                o.TotalAmount,
                o.CreatedAt,
                Items = o.Items.Select(i => new
                {
                    i.ProductId,
                    ProductName = i.Product.Name,
                    ProductImageUrl = i.Product.ImageUrl,
                    i.Quantity,
                    i.UnitPrice,
                    LineTotal = i.Quantity * i.UnitPrice
                })
            })
            .ToListAsync();

        return Ok(orders);
    }

    // =========================
    // PATCH: api/orders/{id}/status
    // Admin/Vendedor: actualizar estado (Kanban)
    // =========================
    [Authorize(Roles = "Admin,Vendedor")]
    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.FindAsync(id);

        if (order == null)
            return NotFound("Orden no encontrada.");

        if (!Enum.IsDefined(typeof(OrderStatus), dto.Status))
            return BadRequest("Estado inválido.");

        order.Status = (OrderStatus)dto.Status;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Estado actualizado correctamente.",
            orderId = order.Id,
            status = order.Status.ToString()
        });
    }
}