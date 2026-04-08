using System.Security.Cryptography;
using System.Text;

namespace ManchesterClothingStore.API.Services
{
    public class PayUService
    {
        private readonly IConfiguration _config;

        public PayUService(IConfiguration config)
        {
            _config = config;
        }

        public object CreatePayment(decimal amount, string referenceCode, string currency = "COP")
        {
            var apiKey = _config["PayU:ApiKey"];
            var merchantId = _config["PayU:MerchantId"];
            var accountId = _config["PayU:AccountId"];

            // 🔥 Generar firma
            var signatureString = $"{apiKey}~{merchantId}~{referenceCode}~{amount}~{currency}";
            var signature = GenerateMD5(signatureString);

            return new
            {
                merchantId,
                accountId,
                referenceCode,
                amount,
                currency,
                signature,
                test = "1", // sandbox
                description = "Compra en Manchester Clothing"
            };
        }

        private string GenerateMD5(string input)
        {
            using var md5 = MD5.Create();
            var inputBytes = Encoding.UTF8.GetBytes(input);
            var hashBytes = md5.ComputeHash(inputBytes);

            var sb = new StringBuilder();
            foreach (var t in hashBytes)
                sb.Append(t.ToString("x2"));

            return sb.ToString();
        }
    }
}