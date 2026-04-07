using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class CreateProductDto
{
    [Required, StringLength(110, MinimumLength = 3)]
    public string Name { get; set; } = string.Empty;

    [Required, StringLength(1500, MinimumLength = 5)]
    public string Description { get; set; } = string.Empty;

    [Range(0.01, 999999999)]
    public decimal Price { get; set; }

    [Range(0, 150)]
    public int Stock { get; set; }

    [Required, MinLength(3)]
    public string Category { get; set; } = string.Empty;

    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    public string Sizes { get; set; } = string.Empty;

    public string Colors { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;
}