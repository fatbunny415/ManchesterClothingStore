namespace ManchesterClothingStore.Application.DTOs;

public class AddCartItemDto
{
    public string ProductId { get; set; } = string.Empty;
    public int Quantity { get; set; } = 1;
}