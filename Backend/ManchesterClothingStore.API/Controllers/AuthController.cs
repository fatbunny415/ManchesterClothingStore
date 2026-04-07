using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using MongoDB.Driver;
using Microsoft.IdentityModel.Tokens;

using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

using ManchesterClothingStore.Infrastructure.Persistence;
using ManchesterClothingStore.Domain.Entities;
using ManchesterClothingStore.Application.DTOs;
using ManchesterClothingStore.Application.Interfaces;
using ManchesterClothingStore.API.Services;
using ManchesterClothingStore.API.Helpers;

namespace ManchesterClothingStore.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MongoDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly RecaptchaService _recaptchaService;
    private readonly ILogger<AuthController> _logger;
    private readonly IEmailService _emailService;

    public AuthController(MongoDbContext db, IConfiguration configuration, RecaptchaService recaptchaService, ILogger<AuthController> logger, IEmailService emailService)
    {
        _db = db;
        _configuration = configuration;
        _recaptchaService = recaptchaService;
        _logger = logger;
        _emailService = emailService;
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
        var passwordError = PasswordValidator.Validate(dto.Password);
        if (passwordError != null)
            return BadRequest(new { message = passwordError });

        if (await _db.Users.Find(u => u.Email == dto.Email).AnyAsync())
            return BadRequest(new { message = "El usuario ya existe." });

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
        };

        await _db.Users.InsertOneAsync(user);

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

        var user = await _db.Users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Credenciales inválidas." });

        var token = GenerateJwtToken(user);
        
        AttachRefreshToken(user);
        await _db.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        return Ok(new
        {
            token,
            role = user.Role.ToString(),
            email = user.Email,
            fullName = user.FullName
        });
    }

    // =========================
    // REFRESH TOKEN
    // =========================
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (string.IsNullOrEmpty(refreshToken))
            return Unauthorized(new { message = "Refresh token no encontrado." });

        var user = await _db.Users.Find(u => u.RefreshToken == refreshToken).FirstOrDefaultAsync();

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            return Unauthorized(new { message = "Refresh token inválido o expirado." });

        // Rotar Refresh Token por seguridad
        var newJwt = GenerateJwtToken(user);
        AttachRefreshToken(user);
        await _db.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        return Ok(new
        {
            token = newJwt,
            role = user.Role.ToString(),
            email = user.Email,
            fullName = user.FullName
        });
    }

    // =========================
    // LOGOUT
    // =========================
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var refreshToken = Request.Cookies["refreshToken"];
        if (!string.IsNullOrEmpty(refreshToken))
        {
            var user = await _db.Users.Find(u => u.RefreshToken == refreshToken).FirstOrDefaultAsync();
            if (user != null)
            {
                user.RefreshToken = null;
                user.RefreshTokenExpiryTime = null;
                await _db.Users.ReplaceOneAsync(u => u.Id == user.Id, user);
            }
        }

        Response.Cookies.Delete("refreshToken", new CookieOptions { HttpOnly = true, SameSite = SameSiteMode.Lax });
        return Ok(new { message = "Sesión cerrada correctamente." });
    }

    // =========================
    // FORGOT PASSWORD
    // =========================
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var user = await _db.Users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();

        if (user == null)
        {
            // Para prevenir ataques de enumeración de correos, devolvemos siempre éxito
            return Ok(new { message = "Si el correo corresponde a una cuenta válida, se ha enviado un enlace de recuperación." });
        }

        var resetToken = RandomNumberGenerator.GetInt32(100000, 999999).ToString();

        user.PasswordResetToken = resetToken;
        user.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(15);

        await _db.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken);

        return Ok(new
        {
            message = "Si el correo corresponde a una cuenta válida, se ha enviado un enlace de recuperación."
        });
    }

    // =========================
    // VERIFY RECOVERY CODE
    // =========================
    [HttpPost("verify-code")]
    public async Task<IActionResult> VerifyCode(VerifyCodeDto dto)
    {
        var user = await _db.Users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();

        if (user == null)
            return NotFound(new { message = "Usuario no encontrado." });

        if (string.IsNullOrWhiteSpace(user.PasswordResetToken) ||
            user.PasswordResetToken != dto.Token)
        {
            return BadRequest(new { message = "Código de recuperación inválido o expirado." });
        }

        if (!user.PasswordResetTokenExpiresAt.HasValue ||
            user.PasswordResetTokenExpiresAt.Value < DateTime.UtcNow)
        {
            return BadRequest(new { message = "El código ha expirado." });
        }

        return Ok(new { message = "Código verificado correctamente." });
    }

    // =========================
    // RESET PASSWORD
    // =========================
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordDto dto)
    {
        var user = await _db.Users.Find(u => u.Email == dto.Email).FirstOrDefaultAsync();

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

        var passwordError = PasswordValidator.Validate(dto.NewPassword);
        if (passwordError != null)
            return BadRequest(new { message = passwordError });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.PasswordResetToken = null;
        user.PasswordResetTokenExpiresAt = null;

        await _db.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

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
            expires: DateTime.UtcNow.AddMinutes(15),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private void AttachRefreshToken(User user)
    {
        var refreshToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
        
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);

        bool isProd = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development";

        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Expires = user.RefreshTokenExpiryTime,
            Secure = isProd, // True en prod (https) obligatorio para cross-domain cookies
            SameSite = isProd ? SameSiteMode.None : SameSiteMode.Lax 
        };

        Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
    }
}