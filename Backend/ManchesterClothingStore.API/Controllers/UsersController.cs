using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;

using System.Security.Claims;

using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Infrastructure.Persistence;
using ManchesterClothingStore.API.Helpers;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly MongoDbContext _db;

    public UsersController(MongoDbContext db)
    {
        _db = db;
    }

    // =========================
    // Helper: obtener UserId desde JWT
    // =========================
    private string GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrWhiteSpace(userIdClaim))
            throw new UnauthorizedAccessException("Token inválido: no se encontró el UserId.");

        return userIdClaim;
    }

    // =========================
    // GET: api/users/me
    // Perfil del usuario autenticado
    // =========================
    [HttpGet("me")]
    public async Task<IActionResult> GetMe()
    {
        var userId = GetUserId();

        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();

        if (user == null)
            return NotFound("Usuario no encontrado.");

        return Ok(new
        {
            user.Id,
            user.FullName,
            user.Email,
            user.PhoneNumber,
            user.Address,
            user.City,
            Role = user.Role.ToString(),
            user.CreatedAt
        });
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

        var passwordError = PasswordValidator.Validate(dto.NewPassword);
        if (passwordError != null)
            return BadRequest(passwordError);

        var userId = GetUserId();

        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound("Usuario no encontrado.");

        var currentPasswordValid = BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash);
        if (!currentPasswordValid)
            return BadRequest("La contraseña actual no es correcta.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);

        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);

        return Ok(new { message = "Contraseña actualizada correctamente." });
    }

    // =========================
    // PUT: api/users/profile
    // Cambiar datos del perfil del usuario (Nombre, Teléfono, Dirección)
    // =========================
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
    {
        var userId = GetUserId();

        var user = await _db.Users.Find(u => u.Id == userId).FirstOrDefaultAsync();
        if (user == null)
            return NotFound("Usuario no encontrado.");

        user.FullName = dto.FullName;
        user.PhoneNumber = dto.PhoneNumber;
        user.Address = dto.Address;
        user.City = dto.City;

        await _db.Users.ReplaceOneAsync(u => u.Id == userId, user);

        return Ok(new 
        { 
            message = "Perfil actualizado correctamente.",
            user = new 
            {
                user.FullName,
                user.PhoneNumber,
                user.Address,
                user.City
            }
        });
    }

    // =========================
    // GET: api/users
    // (Admin) Obtener lista de usuarios
    // =========================
    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetUsers()
    {
        var usersList = await _db.Users.Find(_ => true).SortByDescending(u => u.CreatedAt).ToListAsync();
        
        var users = usersList.Select(u => new
            {
                u.Id,
                u.FullName,
                u.Email,
                RoleLabel = u.Role.ToString(),
                RoleId = (int)u.Role,
                u.CreatedAt
            }).ToList();

        return Ok(users);
    }

    // =========================
    // PUT: api/users/{id}/role
    // (Admin) Actualizar rol (Admin/Vendedor/Cliente)
    // =========================
    [HttpPut("{id}/role")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateRole(string id, [FromBody] UpdateRoleDto dto)
    {
        var currentUserId = GetUserId();

        if (id == currentUserId)
            return BadRequest("No puedes cambiar tu propio rol.");

        var user = await _db.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user == null)
            return NotFound("Usuario no encontrado.");

        if (!Enum.IsDefined(typeof(ManchesterClothingStore.Domain.Enums.UserRole), dto.Role))
            return BadRequest("El rol especificado no es válido.");

        user.Role = (ManchesterClothingStore.Domain.Enums.UserRole)dto.Role;

        await _db.Users.ReplaceOneAsync(u => u.Id == id, user);

        return Ok(new { message = "Rol actualizado correctamente." });
    }

    // =========================
    // DELETE: api/users/{id}
    // (Admin) Eliminar usuario con restricciones
    // =========================
    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var currentUserId = GetUserId();

        if (id == currentUserId)
            return BadRequest("No puedes eliminar tu propia cuenta.");

        var user = await _db.Users.Find(u => u.Id == id).FirstOrDefaultAsync();
        if (user == null)
            return NotFound("Usuario no encontrado.");

        if (user.Role == ManchesterClothingStore.Domain.Enums.UserRole.Admin)
            return BadRequest("Seguridad: Un Administrador no puede eliminar a otro Administrador.");

        await _db.Users.DeleteOneAsync(u => u.Id == id);

        return Ok(new { message = "Usuario eliminado exitosamente." });
    }
}