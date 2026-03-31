using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using System.Security.Claims;

using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Infrastructure.Persistence;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
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
    // GET: api/users/me
    // Perfil del usuario autenticado
    // =========================
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetUserId();

        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                Role = u.Role.ToString(),
                u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound("Usuario no encontrado.");

        return Ok(user);
    }

    // =========================
    // PUT: api/users/change-password
    // Cambiar contraseña del usuario autenticado
    // =========================
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CurrentPassword))
            return BadRequest("La contraseña actual es obligatoria.");

        if (string.IsNullOrWhiteSpace(dto.NewPassword))
            return BadRequest("La nueva contraseña es obligatoria.");

        if (dto.NewPassword.Length < 8)
            return BadRequest("La nueva contraseña debe tener al menos 8 caracteres.");

        var userId = GetUserId();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound("Usuario no encontrado.");

        var currentPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
        if (!currentPasswordValid)
            return BadRequest("La contraseña actual no es correcta.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

        await _context.SaveChangesAsync();

        return Ok("Contraseña actualizada correctamente.");
    }

    // =========================
    // GET: api/users
    // (Admin) Obtener lista de usuarios
    // =========================
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                RoleLabel = u.Role.ToString(),
                RoleId = (int)u.Role,
                u.CreatedAt
            })
            .OrderByDescending(u => u.CreatedAt)
            .ToListAsync();

        return Ok(users);
    }

    // =========================
    // PUT: api/users/{id}/role
    // (Admin) Actualizar rol (Admin/Vendedor/Cliente)
    // =========================
    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleDto dto)
    {
        var currentUserId = GetUserId();

        if (id == currentUserId)
            return BadRequest("No puedes cambiar tu propio rol.");

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Usuario no encontrado.");

        if (!Enum.IsDefined(typeof(ManchesterClothingStore.Domain.Enums.UserRole), dto.Role))
            return BadRequest("El rol especificado no es válido.");

        user.Role = (ManchesterClothingStore.Domain.Enums.UserRole)dto.Role;

        _context.Users.Update(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Rol actualizado correctamente." });
    }

    // =========================
    // DELETE: api/users/{id}
    // (Admin) Eliminar usuario con restricciones
    // =========================
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var currentUserId = GetUserId();

        if (id == currentUserId)
            return BadRequest("No puedes eliminar tu propia cuenta.");

        var user = await _context.Users.FindAsync(id);
        if (user == null)
            return NotFound("Usuario no encontrado.");

        if (user.Role == ManchesterClothingStore.Domain.Enums.UserRole.Admin)
            return BadRequest("Seguridad: Un Administrador no puede eliminar a otro Administrador.");

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Usuario eliminado exitosamente." });
    }
}