namespace ManchesterClothingStore.Application.DTOs;

public class ForgotPasswordDto
{
    public string Email { get; set; } = string.Empty;
    public string RecaptchaToken { get; set; } = string.Empty;
}