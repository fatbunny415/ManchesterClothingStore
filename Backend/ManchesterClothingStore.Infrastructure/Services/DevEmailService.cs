using Microsoft.Extensions.Logging;
using ManchesterClothingStore.Application.Interfaces;

namespace ManchesterClothingStore.Infrastructure.Services;

public class DevEmailService : IEmailService
{
    private readonly ILogger<DevEmailService> _logger;

    public DevEmailService(ILogger<DevEmailService> logger)
    {
        _logger = logger;
    }

    public Task SendPasswordResetEmailAsync(string toEmail, string resetCode)
    {
        // Simulador de envío en entorno de desarrollo.
        // Formatea la "salida" como si fuera un template de correo atractivo.
        
        _logger.LogInformation("\n");
        _logger.LogInformation("=========================================================================");
        _logger.LogInformation("✉️ NUEVO CORREO ELECTRÓNICO INTERCEPTADO (MODO DESARROLLO)");
        _logger.LogInformation("=========================================================================");
        _logger.LogInformation("Para:      {Email}", toEmail);
        _logger.LogInformation("Asunto:    Tu código de seguridad Manchester");
        _logger.LogInformation("-------------------------------------------------------------------------");
        _logger.LogInformation("Hola,");
        _logger.LogInformation("");
        _logger.LogInformation("Recibimos una solicitud para restablecer tu contraseña.");
        _logger.LogInformation("Tu código de verificación de 6 dígitos es:");
        _logger.LogInformation("");
        _logger.LogInformation("         ┌──────────────┐");
        _logger.LogInformation("         │    {Code}    │", resetCode);
        _logger.LogInformation("         └──────────────┘");
        _logger.LogInformation("");
        _logger.LogInformation("Este código expira en 15 minutos.");
        _logger.LogInformation("Si no solicitaste este cambio, puedes ignorar este mensaje.");
        _logger.LogInformation("");
        _logger.LogInformation("Equipo Manchester");
        _logger.LogInformation("=========================================================================\n");

        return Task.CompletedTask;
    }
}
