// c:\Users\simon\Desktop\ManchesterClothingStore\Backend\ManchesterClothingStore.Application\DTOs\UpdateProfileDto.cs
using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(75, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 75 caracteres")]
    public string FullName { get; set; } = string.Empty;

    [StringLength(20, ErrorMessage = "El teléfono no puede exceder los 20 caracteres")]
    public string? PhoneNumber { get; set; }

    [StringLength(100, ErrorMessage = "La dirección no puede exceder los 100 caracteres")]
    public string? Address { get; set; }

    [StringLength(50, ErrorMessage = "La ciudad no puede exceder los 50 caracteres")]
    public string? City { get; set; }
}
