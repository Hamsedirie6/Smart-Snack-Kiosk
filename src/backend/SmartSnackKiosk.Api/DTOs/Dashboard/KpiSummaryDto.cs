namespace SmartSnackKiosk.Api.DTOs.Dashboard;

public class KpiSummaryDto
{
    public decimal RevenueToday { get; set; }
    public decimal RevenueThisWeek { get; set; }
    public decimal RevenueThisMonth { get; set; }
    public int SalesCountToday { get; set; }
    public int SalesCountThisWeek { get; set; }
    public int SalesCountThisMonth { get; set; }
    public decimal AverageSaleAmountToday { get; set; }
    public decimal AverageSaleAmountThisWeek { get; set; }
    public decimal AverageSaleAmountThisMonth { get; set; }
}