using System.Text.Json;

namespace ManchesterClothingStore.API.Services;

public class RecaptchaService
{
    private readonly HttpClient _httpClient;
    private readonly string _secretKey;

    public RecaptchaService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _secretKey = configuration["Recaptcha:SecretKey"] 
            ?? throw new InvalidOperationException("Recaptcha:SecretKey is not configured.");
    }

    public async Task<bool> ValidateAsync(string? token, string expectedAction)
    {
        if (string.IsNullOrWhiteSpace(token))
            return false;

        var response = await _httpClient.PostAsync(
            $"https://www.google.com/recaptcha/api/siteverify?secret={_secretKey}&response={token}",
            null
        );

        var json = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<RecaptchaResponse>(json);

        if (result == null || !result.success)
            return false;

        // reCAPTCHA v3 returns a score (0.0 = bot, 1.0 = human)
        if (result.score < 0.5)
            return false;

        // Verify the action matches what we expect
        if (!string.Equals(result.action, expectedAction, StringComparison.OrdinalIgnoreCase))
            return false;

        return true;
    }

    private class RecaptchaResponse
    {
        public bool success { get; set; }
        public float score { get; set; }
        public string? action { get; set; }
        public string? challenge_ts { get; set; }
        public string? hostname { get; set; }
    }
}
