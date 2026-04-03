using System.Text.RegularExpressions;

namespace ManchesterClothingStore.API.Helpers;

public static class PasswordValidator
{
    /// <summary>
    /// Valida la complejidad de una contraseña.
    /// Retorna un mensaje de error si es inválida, o null si es válida.
    /// </summary>
    public static string? Validate(string password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < 8)
            return "La contraseña debe tener al menos 8 caracteres.";

        if (!Regex.IsMatch(password, @"[A-Z]"))
            return "La contraseña debe contener al menos una letra mayúscula.";

        if (!Regex.IsMatch(password, @"\d"))
            return "La contraseña debe contener al menos un número.";

        if (!Regex.IsMatch(password, @"[@$!%*?&#^()]"))
            return "La contraseña debe contener al menos un carácter especial (@$!%*?&#^()).";

        return null;
    }
}
