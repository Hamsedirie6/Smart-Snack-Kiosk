namespace SmartSnackKiosk.Api.DTOs.Dashboard;

public class LowStockProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int StockQuantity { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string StockStatus { get; set; } = string.Empty;
}
