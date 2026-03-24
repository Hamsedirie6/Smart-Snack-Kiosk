namespace SmartSnackKiosk.Api.DTOs.Dashboard;

public class SalesOverTimeDto
{
    public DateTime Date { get; set; }
    public decimal Revenue { get; set; }
    public int SalesCount { get; set; }
}