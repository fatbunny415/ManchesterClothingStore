using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Domain.Enums;
using ManchesterClothingStore.Infrastructure.Persistence;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly AppDbContext _context;

    public OrdersController(AppDbContext context)
    {
        _context = context;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("Token inválido.");
        return Guid.Parse(userIdClaim);
    }

    private async Task<List<Order>> PopulateOrderItemsAndProductsAsync(List<Order> orders)
    {
        if (!orders.Any()) return orders;

        var orderIds = orders.Select(o => o.Id).ToList();
        var allOrderItems = await _context.OrderItems
            .Where(i => orderIds.Contains(i.OrderId))
            .ToListAsync();

        var productIds = allOrderItems.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id))
            .ToDictionaryAsync(p => p.Id);

        foreach (var order in orders)
        {
            order.Items = allOrderItems.Where(i => i.OrderId == order.Id).ToList();
            foreach (var item in order.Items)
            {
                if (products.TryGetValue(item.ProductId, out var product))
                    item.Product = product;
            }
        }
        return orders;
    }
    
    private async Task<List<Order>> PopulateUserAsync(List<Order> orders)
    {
        if (!orders.Any()) return orders;
        var userIds = orders.Select(o => o.UserId).Distinct().ToList();
        var users = await _context.Users.Where(u => userIds.Contains(u.Id)).ToDictionaryAsync(u => u.Id);
        
        foreach (var order in orders)
        {
            if (users.TryGetValue(order.UserId, out var user))
                order.User = user;
        }
        return orders;
    }

    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        var userId = GetUserId();

        // Obtener carrito sin .Include()
        var cart = await _context.Carts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (cart == null) return BadRequest("El carrito está vacío.");

        cart.Items = await _context.CartItems.Where(i => i.CartId == cart.Id).ToListAsync();
        if (!cart.Items.Any()) return BadRequest("El carrito está vacío.");

        var productIds = cart.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _context.Products.Where(p => productIds.Contains(p.Id)).ToDictionaryAsync(p => p.Id);

        foreach (var item in cart.Items)
        {
            if (products.TryGetValue(item.ProductId, out var product))
                item.Product = product;

            if (item.Product == null || item.Product.Stock < item.Quantity)
                return BadRequest($"Stock insuficiente para {item.Product?.Name ?? "el producto."}");
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in cart.Items)
        {
            item.Product!.Stock -= item.Quantity;

            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        _context.Orders.Add(order);
        foreach (var oi in order.Items)
        {
            oi.OrderId = order.Id;
            _context.OrderItems.Add(oi);
        }
        _context.CartItems.RemoveRange(cart.Items);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Orden creada correctamente.",
            orderId = order.Id,
            total = order.TotalAmount,
            status = order.Status.ToString()
        });
    }

    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();
        var rawOrders = await _context.Orders
            .Where(o => o.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        var orders = await PopulateOrderItemsAndProductsAsync(rawOrders);

        var result = orders.Select(o => new
        {
            o.Id,
            Status = o.Status.ToString(),
            o.TotalAmount,
            o.CreatedAt,
            Items = o.Items.Select(i => new
            {
                i.ProductId,
                ProductName = i.Product?.Name ?? "Producto Desconocido",
                i.Quantity,
                i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice
            })
        });

        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrderById(Guid id)
    {
        var userId = GetUserId();
        var order = await _context.Orders.FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);
        
        if (order == null) return NotFound("Orden no encontrada.");
        await PopulateOrderItemsAndProductsAsync(new List<Order> { order });

        return Ok(new
        {
            order.Id,
            Status = order.Status.ToString(),
            order.TotalAmount,
            order.CreatedAt,
            Items = order.Items.Select(i => new
            {
                i.ProductId,
                ProductName = i.Product?.Name ?? "Producto Desconocido",
                i.Quantity,
                i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice
            })
        });
    }

    [Authorize(Roles = "Admin,Vendedor")]
    [HttpGet]
    public async Task<IActionResult> GetAllOrders()
    {
        var rawOrders = await _context.Orders.OrderByDescending(o => o.CreatedAt).ToListAsync();
        await PopulateOrderItemsAndProductsAsync(rawOrders);
        await PopulateUserAsync(rawOrders);

        var result = rawOrders.Select(o => new
        {
            o.Id,
            o.UserId,
            CustomerName = o.User?.FullName ?? "Sin nombre",
            CustomerEmail = o.User?.Email ?? "Sin correo",
            Status = o.Status.ToString(),
            o.TotalAmount,
            o.CreatedAt,
            Items = o.Items.Select(i => new
            {
                i.ProductId,
                ProductName = i.Product?.Name ?? "Producto Desconocido",
                i.Quantity,
                i.UnitPrice,
                LineTotal = i.Quantity * i.UnitPrice
            })
        });

        return Ok(result);
    }

    [Authorize(Roles = "Admin,Vendedor")]
    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null) return NotFound("Orden no encontrada.");

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