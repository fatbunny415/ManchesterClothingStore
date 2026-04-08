using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using System.Security.Claims;

using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Domain.Enums;
using ManchesterClothingStore.Infrastructure.Persistence;
using ManchesterClothingStore.Application.Interfaces;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly IEmailService _emailService;

    public OrdersController(MongoDbContext db, IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("Token inválido.");

        return userIdClaim;
    }

    // =========================
    // POST: api/orders/checkout
    // Crear orden desde carrito
    // =========================
    [Authorize]
    [HttpPost("checkout")]
    public async Task<IActionResult> Checkout()
    {
        var userId = GetUserId();

        var cart = await _db.Carts.Find(c => c.UserId == userId).FirstOrDefaultAsync();

        if (cart == null || !cart.Items.Any())
            return BadRequest("El carrito está vacío.");

        var productIds = cart.Items.Select(i => i.ProductId).Distinct().ToList();
        var products = await _db.Products.Find(p => productIds.Contains(p.Id)).ToListAsync();
        var productDict = products.ToDictionary(p => p.Id);

        foreach (var item in cart.Items)
        {
            var product = productDict.GetValueOrDefault(item.ProductId);
            if (product == null)
                return BadRequest($"Producto no encontrado.");

            if (product.Stock < item.Quantity)
                return BadRequest($"Stock insuficiente para {product.Name}");
        }

        var order = new Order
        {
            UserId = userId,
            Status = OrderStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        foreach (var item in cart.Items)
        {
             var product = productDict[item.ProductId];
             product.Stock -= item.Quantity;

             await _db.Products.ReplaceOneAsync(p => p.Id == product.Id, product);

            order.Items.Add(new OrderItem
            {
                ProductId = item.ProductId,
                ProductName = product.Name,
                ProductImageUrl = product.ImageUrl,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            });
        }

        order.TotalAmount = order.Items.Sum(i => i.Quantity * i.UnitPrice);

        await _db.Orders.InsertOneAsync(order);

        // Limpiar el carrito
        cart.Items.Clear();
        await _db.Carts.ReplaceOneAsync(c => c.Id == cart.Id, cart);

        // Enviar email simulado
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user != null)
        {
            await _emailService.SendOrderConfirmationEmailAsync(
                user.Email, 
                user.FullName, 
                order.Id, 
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
    [Authorize]
    [HttpGet("my-orders")]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = GetUserId();

        var ordersList = await _db.Orders.Find(o => o.UserId == userId).SortByDescending(o => o.CreatedAt).ToListAsync();
        
        var orders = ordersList.Select(o => new
            {
                o.Id,
                Status = o.Status.ToString(),
                o.TotalAmount,
                o.CreatedAt,
                Items = o.Items.Select(i => new
                {
                    i.ProductId,
                    i.ProductName,
                    i.ProductImageUrl,
                    i.Quantity,
                    i.UnitPrice,
                    i.LineTotal
                })
            }).ToList();

        return Ok(orders);
    }

    // =========================
    // GET: api/orders/{id}
    // Ver detalle de una orden propia
    // =========================
    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrderById(string id)
    {
        var userId = GetUserId();

        var order = await _db.Orders.Find(o => o.Id == id && o.UserId == userId).FirstOrDefaultAsync();

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
                i.ProductName,
                i.ProductImageUrl,
                i.Quantity,
                i.UnitPrice,
                i.LineTotal
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
        var ordersList = await _db.Orders.Find(_ => true).SortByDescending(o => o.CreatedAt).ToListAsync();
        var userIds = ordersList.Select(o => o.UserId).Distinct().ToList();
        var users = await _db.Users.Find(u => userIds.Contains(u.Id)).ToListAsync();
        var userDict = users.ToDictionary(u => u.Id);

        var ordersObj = ordersList.Select(o => 
            {
                var user = userDict.GetValueOrDefault(o.UserId);
                return new
                {
                    o.Id,
                    o.UserId,
                    CustomerName = user != null ? user.FullName : "Sin nombre",
                    CustomerEmail = user != null ? user.Email : "Sin correo",
                    Status = o.Status.ToString(),
                    o.TotalAmount,
                    o.CreatedAt,
                    Items = o.Items.Select(i => new
                    {
                        i.ProductId,
                        i.ProductName,
                        i.ProductImageUrl,
                        i.Quantity,
                        i.UnitPrice,
                        i.LineTotal
                    })
                };
            }).ToList();

        return Ok(ordersObj);
    }

    // =========================
    // PATCH: api/orders/{id}/status
    // Admin/Vendedor: actualizar estado (Kanban)
    // =========================
    [Authorize(Roles = "Admin,Vendedor")]
    [HttpPatch("{id}/status")]
    public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateOrderStatusDto dto)
    {
        var order = await _db.Orders.Find(o => o.Id == id).FirstOrDefaultAsync();

        if (order == null)
            return NotFound("Orden no encontrada.");

        if (!Enum.IsDefined(typeof(OrderStatus), dto.Status))
            return BadRequest("Estado inválido.");

        order.Status = (OrderStatus)dto.Status;

        await _db.Orders.ReplaceOneAsync(o => o.Id == id, order);

        return Ok(new
        {
            message = "Estado actualizado correctamente.",
            orderId = order.Id,
            status = order.Status.ToString()
        });
    }

    // =========================
    // POST: api/orders/{id}/confirm-payment
    // Cliente: Simular confirmación de pago
    // =========================
    [Authorize]
    [HttpPost("{id}/confirm-payment")]
    public async Task<IActionResult> ConfirmPayment(string id, [FromBody] ConfirmPaymentDto dto)
    {
        var userId = GetUserId();

        var order = await _db.Orders.Find(o => o.Id == id && o.UserId == userId).FirstOrDefaultAsync();

        if (order == null)
            return NotFound("Orden no encontrada.");

        if (order.Status != OrderStatus.Pending)
            return BadRequest("Solo se pueden confirmar órdenes en estado Pending.");

        // Simular confirmación de pago exitosa
        order.Status = OrderStatus.Paid;

        await _db.Orders.ReplaceOneAsync(o => o.Id == id, order);

        // Enviar email de confirmación de pago simulado
        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user != null)
        {
            await _emailService.SendOrderConfirmationEmailAsync(
                user.Email,
                user.FullName,
                order.Id,
                order.TotalAmount
            );
        }

        return Ok(new
        {
            message = "Pago confirmado exitosamente.",
            orderId = order.Id,
            status = order.Status.ToString(),
            totalAmount = order.TotalAmount
        });
    }
}

public class ConfirmPaymentDto
{
    public string? PaymentMethod { get; set; }
}