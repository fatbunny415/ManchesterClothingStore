// c:\Users\simon\Desktop\ManchesterClothingStore\Backend\ManchesterClothingStore.Application\DTOs\UpdateProfileDto.cs
using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class UpdateProfileDto
{
    [Required(ErrorMessage = "El nombre es obligatorio")]
    [StringLength(100, MinimumLength = 3, ErrorMessage = "El nombre debe tener entre 3 y 100 caracteres")]
    public string FullName { get; set; } = string.Empty;

    public string? PhoneNumber { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
}
