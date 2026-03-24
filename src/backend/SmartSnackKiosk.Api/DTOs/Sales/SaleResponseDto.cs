namespace SmartSnackKiosk.Api.DTOs.Sales;

public class SaleResponseDto
{
    public int SaleId { get; set; }
    public DateTime CreatedAt { get; set; }
    public decimal TotalAmount { get; set; }
    public List<SaleItemResponseDto> Items { get; set; } = new();
}