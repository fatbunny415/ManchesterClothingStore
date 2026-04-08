using Microsoft.AspNetCore.Mvc;
using ManchesterClothingStore.API.Services;

namespace ManchesterClothingStore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayUController : ControllerBase
    {
        private readonly PayUService _payUService;

        public PayUController(PayUService payUService)
        {
            _payUService = payUService;
        }

        [HttpPost("create-payment")]
        public IActionResult CreatePayment([FromBody] PaymentRequest request)
        {
            var result = _payUService.CreatePayment(
                request.Amount,
                request.ReferenceCode,
                request.Currency
            );

            return Ok(result);
        }
    }

    public class PaymentRequest
    {
        public decimal Amount { get; set; }
        public string ReferenceCode { get; set; }
        public string Currency { get; set; } = "COP";
    }
}