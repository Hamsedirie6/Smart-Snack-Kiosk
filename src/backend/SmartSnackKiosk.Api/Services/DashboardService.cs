using Microsoft.EntityFrameworkCore;
using SmartSnackKiosk.Api.Data;
using SmartSnackKiosk.Api.DTOs.Dashboard;
using SmartSnackKiosk.Api.Entities;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Services;

public class DashboardService : IDashboardService
{
    private readonly AppDbContext _context;

    public DashboardService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<KpiSummaryDto> GetKpiSummaryAsync()
    {
        var today = DateTime.UtcNow.Date;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        var sales = await _context.Sales
            .Include(s => s.SaleItems)
            .ToListAsync();

        return new KpiSummaryDto
        {
            RevenueToday = sales.Where(s => s.CreatedAt.Date == today).Sum(s => s.TotalAmount),
            RevenueThisWeek = sales.Where(s => s.CreatedAt.Date >= startOfWeek).Sum(s => s.TotalAmount),
            RevenueThisMonth = sales.Where(s => s.CreatedAt.Date >= startOfMonth).Sum(s => s.TotalAmount),
            SalesCountToday = sales.Count(s => s.CreatedAt.Date == today),
            SalesCountThisWeek = sales.Count(s => s.CreatedAt.Date >= startOfWeek),
            SalesCountThisMonth = sales.Count(s => s.CreatedAt.Date >= startOfMonth),
            AverageSaleAmountToday = sales.Where(s => s.CreatedAt.Date == today).DefaultIfEmpty().Average(s => s?.TotalAmount ?? 0),
            AverageSaleAmountThisWeek = sales.Where(s => s.CreatedAt.Date >= startOfWeek).DefaultIfEmpty().Average(s => s?.TotalAmount ?? 0),
            AverageSaleAmountThisMonth = sales.Where(s => s.CreatedAt.Date >= startOfMonth).DefaultIfEmpty().Average(s => s?.TotalAmount ?? 0)
        };
    }

    public async Task<List<SalesOverTimeDto>> GetSalesOverTimeAsync(string period)
    {
        var today = DateTime.UtcNow.Date;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        IQueryable<Sale> query = _context.Sales;

        if (period == "today")
        {
            query = query.Where(s => s.CreatedAt.Date == today);
        }
        else if (period == "week")
        {
            query = query.Where(s => s.CreatedAt.Date >= startOfWeek);
        }
        else if (period == "month")
        {
            query = query.Where(s => s.CreatedAt.Date >= startOfMonth);
        }
        else
        {
            throw new ArgumentException("Invalid period specified.");
        }

        return await query
            .GroupBy(s => s.CreatedAt.Date)
            .Select(g => new SalesOverTimeDto
            {
                Date = g.Key,
                Revenue = g.Sum(s => s.TotalAmount),
                SalesCount = g.Count()
            })
            .ToListAsync();
    }

    public async Task<List<TopProductDto>> GetTopProductsAsync(string period, int top)
    {
        var today = DateTime.UtcNow.Date;
        var startOfWeek = today.AddDays(-(int)today.DayOfWeek);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        IQueryable<SaleItem> query = _context.SaleItems.Include(si => si.Product);

        if (period == "today")
        {
            query = query.Where(si => si.Sale.CreatedAt.Date == today);
        }
        else if (period == "week")
        {
            query = query.Where(si => si.Sale.CreatedAt.Date >= startOfWeek);
        }
        else if (period == "month")
        {
            query = query.Where(si => si.Sale.CreatedAt.Date >= startOfMonth);
        }
        else
        {
            throw new ArgumentException("Invalid period specified.");
        }

        return await query
            .GroupBy(si => new { si.ProductId, si.Product.Name })
            .OrderByDescending(g => g.Sum(si => si.Quantity))
            .Take(top)
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.Name,
                UnitsSold = g.Sum(si => si.Quantity),
                Revenue = g.Sum(si => si.LineTotal)
            })
            .ToListAsync();
    }

    public async Task<List<LowStockProductDto>> GetLowStockProductsAsync()
    {
        return await _context.Products
            .Include(p => p.Category)
            .Where(p => p.StockQuantity <= 3)
            .Select(p => new LowStockProductDto
            {
                ProductId = p.Id,
                ProductName = p.Name,
                StockQuantity = p.StockQuantity,
                CategoryName = p.Category.Name,
                StockStatus = p.StockQuantity == 0 ? "Slut i lager" :
                              p.StockQuantity <= 3 ? "Lågt lager" : "I lager"
            })
            .ToListAsync();
    }
}
