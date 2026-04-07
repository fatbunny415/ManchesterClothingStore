using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class ResetPasswordDto
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato del correo no es válido.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "El token es obligatorio.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contraseña es obligatoria.")]
    [StringLength(75, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 75 caracteres.")]
    public string NewPassword { get; set; } = string.Empty;
}