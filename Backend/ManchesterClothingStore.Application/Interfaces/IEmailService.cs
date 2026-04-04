namespace ManchesterClothingStore.Application.Interfaces;

public interface IEmailService
{
    Task SendPasswordResetEmailAsync(string toEmail, string resetCode);
    Task SendOrderConfirmationEmailAsync(string toEmail, string customerName, string orderId, decimal totalAmount);
}
