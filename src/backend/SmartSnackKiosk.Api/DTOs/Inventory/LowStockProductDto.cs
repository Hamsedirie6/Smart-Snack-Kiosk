namespace SmartSnackKiosk.Api.DTOs.Inventory;

public class LowStockProductDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public int StockQuantity { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string StockStatus { get; set; } = string.Empty;
}
