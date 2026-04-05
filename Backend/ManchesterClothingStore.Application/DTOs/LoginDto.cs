using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class LoginDto
{
    [Required]
    [EmailAddress]
    [StringLength(110, ErrorMessage = "El correo no puede exceder los 110 caracteres.")]
    public string Email { get; set; } = string.Empty;

    [Required]
    [StringLength(75, MinimumLength = 6, ErrorMessage = "La contraseña debe tener entre 6 y 75 caracteres.")]
    public string Password { get; set; } = string.Empty;

    public string? RecaptchaToken { get; set; }
}