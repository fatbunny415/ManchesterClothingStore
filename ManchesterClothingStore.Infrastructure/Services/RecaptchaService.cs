using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using ManchesterClothingStore.Application.Interfaces;

namespace ManchesterClothingStore.Infrastructure.Services;

public class RecaptchaResponse
{
    public bool Success { get; set; }
    public decimal Score { get; set; }
    public string Action { get; set; } = string.Empty;
    public DateTime ChallengeTs { get; set; }
    public string Hostname { get; set; } = string.Empty;
}

public class RecaptchaService : IRecaptchaService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public RecaptchaService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<bool> VerifyTokenAsync(string token)
    {
        var secretKey = _configuration["RecaptchaSettings:SecretKey"];
        
        // In case the key is missing or not configured, return false to prevent bypass, 
        // though during dev returning true might be useful. We'll enforce validation here.
        if (string.IsNullOrEmpty(secretKey) || secretKey == "YOUR_SECRET_KEY_HERE")
        {
            // For safety, require missing keys to fail validation, unless intentionally bypassed
            return false;
        }

        var response = await _httpClient.PostAsync(
            $"https://www.google.com/recaptcha/api/siteverify?secret={secretKey}&response={token}",
            null
        );

        if (!response.IsSuccessStatusCode)
            return false;

        var result = await response.Content.ReadFromJsonAsync<RecaptchaResponse>();

        // reCAPTCHA v3 returns a score (1.0 is very likely a human, 0.0 is very likely a bot).
        return result != null && result.Success && result.Score >= 0.5m;
    }
}
