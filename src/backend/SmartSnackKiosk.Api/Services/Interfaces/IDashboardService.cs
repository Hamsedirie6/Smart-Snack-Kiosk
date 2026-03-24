using SmartSnackKiosk.Api.DTOs.Dashboard;

namespace SmartSnackKiosk.Api.Services.Interfaces;

public interface IDashboardService
{
    Task<KpiSummaryDto> GetKpiSummaryAsync();
    Task<List<SalesOverTimeDto>> GetSalesOverTimeAsync(string period);
    Task<List<TopProductDto>> GetTopProductsAsync(string period, int top);
    Task<List<LowStockProductDto>> GetLowStockProductsAsync();
}