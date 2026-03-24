namespace SmartSnackKiosk.Api.DTOs.Sales;

public class CreateSaleRequestDto
{
    public List<CreateSaleItemDto> Items { get; set; } = new();
}