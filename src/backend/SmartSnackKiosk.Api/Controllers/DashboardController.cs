using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("kpis")]
    public async Task<IActionResult> GetKpis()
    {
        var kpis = await _dashboardService.GetKpiSummaryAsync();
        return Ok(kpis);
    }

    [HttpGet("sales-over-time")]
    public async Task<IActionResult> GetSalesOverTime([FromQuery] string period)
    {
        var sales = await _dashboardService.GetSalesOverTimeAsync(period);
        return Ok(sales);
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts([FromQuery] string period, [FromQuery] int top = 5)
    {
        var products = await _dashboardService.GetTopProductsAsync(period, top);
        return Ok(products);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStockProducts()
    {
        var products = await _dashboardService.GetLowStockProductsAsync();
        return Ok(products);
    }
}