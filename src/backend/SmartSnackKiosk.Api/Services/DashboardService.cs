using Microsoft.EntityFrameworkCore;
using SmartSnackKiosk.Api.Data;
using SmartSnackKiosk.Api.DTOs.Dashboard;
using SmartSnackKiosk.Api.Entities;
using SmartSnackKiosk.Api.Helpers;
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
        var startOfWeek = GetStartOfWeek(today);
        var startOfMonth = new DateTime(today.Year, today.Month, 1);

        // Ladda bara innevarande månads försäljningar – inte hela historiken
        var salesThisMonth = await _context.Sales
            .Where(s => s.CreatedAt.Date >= startOfMonth)
            .ToListAsync();

        var salesToday = salesThisMonth.Where(s => s.CreatedAt.Date == today).ToList();
        var salesThisWeek = salesThisMonth.Where(s => s.CreatedAt.Date >= startOfWeek).ToList();

        return new KpiSummaryDto
        {
            RevenueToday = salesToday.Sum(s => s.TotalAmount),
            RevenueThisWeek = salesThisWeek.Sum(s => s.TotalAmount),
            RevenueThisMonth = salesThisMonth.Sum(s => s.TotalAmount),
            SalesCountToday = salesToday.Count,
            SalesCountThisWeek = salesThisWeek.Count,
            SalesCountThisMonth = salesThisMonth.Count,
            AverageSaleAmountToday = salesToday.Count > 0 ? salesToday.Average(s => s.TotalAmount) : 0,
            AverageSaleAmountThisWeek = salesThisWeek.Count > 0 ? salesThisWeek.Average(s => s.TotalAmount) : 0,
            AverageSaleAmountThisMonth = salesThisMonth.Count > 0 ? salesThisMonth.Average(s => s.TotalAmount) : 0
        };
    }

    public async Task<List<SalesOverTimeDto>> GetSalesOverTimeAsync(string period)
    {
        var today = DateTime.UtcNow.Date;
        var startOfWeek = GetStartOfWeek(today);
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
            throw new ArgumentException($"Ogiltigt period-värde: '{period}'. Tillåtna värden är 'today', 'week', 'month'.");
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
        var startOfWeek = GetStartOfWeek(today);
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
            throw new ArgumentException($"Ogiltigt period-värde: '{period}'. Tillåtna värden är 'today', 'week', 'month'.");
        }

        return await query
            .GroupBy(si => new { si.ProductId, si.ProductName })
            .OrderByDescending(g => g.Sum(si => si.Quantity))
            .Take(top)
            .Select(g => new TopProductDto
            {
                ProductId = g.Key.ProductId,
                ProductName = g.Key.ProductName,
                UnitsSold = g.Sum(si => si.Quantity),
                Revenue = g.Sum(si => si.LineTotal)
            })
            .ToListAsync();
    }

    public async Task<List<LowStockProductDto>> GetLowStockProductsAsync()
    {
        // Ladda låglagerprodukter (litet dataset) och mappa i minnet
        // så att vi kan använda den gemensamma StockStatusHelper
        var products = await _context.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .Where(p => p.StockQuantity <= StockStatusHelper.LowStockThreshold)
            .ToListAsync();

        return products.Select(p => new LowStockProductDto
        {
            ProductId = p.Id,
            ProductName = p.Name,
            StockQuantity = p.StockQuantity,
            CategoryName = p.Category.Name,
            StockStatus = StockStatusHelper.GetStockStatus(p.StockQuantity)
        }).ToList();
    }

    // Hjälpmetod: returnerar måndagen i aktuell vecka
    private static DateTime GetStartOfWeek(DateTime date)
    {
        // DayOfWeek: Sunday=0, Monday=1 ... Saturday=6
        // Formeln (day + 6) % 7 ger antal dagar sedan måndag
        var daysFromMonday = ((int)date.DayOfWeek + 6) % 7;
        return date.AddDays(-daysFromMonday);
    }
}
