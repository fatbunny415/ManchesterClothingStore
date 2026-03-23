using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.RegularExpressions;

using ManchesterClothingStore.Infrastructure.Persistence;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.API.Services;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly RecaptchaService _recaptchaService;

    public AuthController(AppDbContext context, IConfiguration configuration, RecaptchaService recaptchaService)
    {
        _context = context;
        _configuration = configuration;
        _recaptchaService = recaptchaService;
    }

    // =========================
    // REGISTER
    // =========================
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        // Validate reCAPTCHA
        var isHuman = await _recaptchaService.ValidateAsync(dto.RecaptchaToken, "register");
        if (!isHuman)
            return BadRequest(new { message = "Verificación reCAPTCHA fallida. Intenta de nuevo." });

        // Server-side password validation
        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 8)
            return BadRequest(new { message = "La contraseña debe tener al menos 8 caracteres." });

        if (!Regex.IsMatch(dto.Password, @"[A-Z]"))
            return BadRequest(new { message = "La contraseña debe contener al menos una letra mayúscula." });

        if (!Regex.IsMatch(dto.Password, @"\d"))
            return BadRequest(new { message = "La contraseña debe contener al menos un número." });

        if (!Regex.IsMatch(dto.Password, @"[@$!%*?&#^()]"))
            return BadRequest(new { message = "La contraseña debe contener al menos un carácter especial (@$!%*?&#^())." });

        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest(new { message = "El usuario ya existe." });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Usuario registrado correctamente." });
    }

    // =========================
    // LOGIN (Rate Limited)
    // =========================
    [HttpPost("login")]
    [EnableRateLimiting("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        // Validate reCAPTCHA
        var isHuman = await _recaptchaService.ValidateAsync(dto.RecaptchaToken, "login");
        if (!isHuman)
            return BadRequest(new { message = "Verificación reCAPTCHA fallida. Intenta de nuevo." });

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Credenciales inválidas." });

        var token = GenerateJwtToken(user);

        return Ok(new
        {
            token,
            role = user.Role.ToString(),
            email = user.Email,
            fullName = user.FullName
        });
    }

    // =========================
    // FORGOT PASSWORD
    // =========================
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            return NotFound(new { message = "No existe un usuario con ese correo." });

        var resetToken = Guid.NewGuid().ToString("N");

        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Token de recuperación generado correctamente.",
            resetToken,
            expiresAt = user.PasswordResetTokenExpiresAt
        });
    }

    // =========================
    // RESET PASSWORD
    // =========================
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null)
            return NotFound(new { message = "Usuario no encontrado." });

        if (string.IsNullOrWhiteSpace(user.PasswordResetToken) ||
            user.PasswordResetToken != dto.Token)
        {
            return BadRequest(new { message = "Token inválido." });
        }

        if (!user.PasswordResetTokenExpiresAt.HasValue ||
            user.PasswordResetTokenExpiresAt.Value < DateTime.UtcNow)
        {
            return BadRequest(new { message = "El token ha expirado." });
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Contraseña restablecida correctamente." });
    }

    // =========================
    // GENERATE JWT
    // =========================
    private string GenerateJwtToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)
        );

        var credentials = new SigningCredentials(
            key,
            SecurityAlgorithms.HmacSha256
        );

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, user.Role.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}