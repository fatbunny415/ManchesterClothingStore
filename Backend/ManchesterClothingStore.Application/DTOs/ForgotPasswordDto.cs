using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class ForgotPasswordDto
{
    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El formato del correo no es válido.")]
    public string Email { get; set; } = string.Empty;
}