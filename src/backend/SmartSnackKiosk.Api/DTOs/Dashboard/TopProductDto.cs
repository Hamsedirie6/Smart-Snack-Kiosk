namespace SmartSnackKiosk.Api.DTOs.Dashboard;

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; }
    public int UnitsSold { get; set; }
    public decimal Revenue { get; set; }
}