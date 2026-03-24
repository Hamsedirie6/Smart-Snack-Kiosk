namespace SmartSnackKiosk.Api.DTOs.Dashboard;

public class LowStockProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int StockQuantity { get; set; }
    public string CategoryName { get; set; }
    public string StockStatus { get; set; }
}