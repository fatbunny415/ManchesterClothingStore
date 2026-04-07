using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class ChangePasswordDto
{
    [Required(ErrorMessage = "La contraseña actual es obligatoria.")]
    public string CurrentPassword { get; set; } = string.Empty;

    [Required(ErrorMessage = "La nueva contraseña es obligatoria.")]
    [StringLength(75, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 75 caracteres.")]
    public string NewPassword { get; set; } = string.Empty;
}