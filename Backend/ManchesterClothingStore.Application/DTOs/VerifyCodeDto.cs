using System.ComponentModel.DataAnnotations;

namespace ManchesterClothingStore.Application.DTOs;

public class VerifyCodeDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;
}
