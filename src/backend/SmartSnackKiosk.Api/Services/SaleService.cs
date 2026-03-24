using Microsoft.EntityFrameworkCore;
using SmartSnackKiosk.Api.Data;
using SmartSnackKiosk.Api.DTOs.Sales;
using SmartSnackKiosk.Api.Entities;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Services;

public class SaleService : ISaleService
{
    private readonly AppDbContext _context;

    public SaleService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<CreateSaleResponseDto> CreateSaleAsync(CreateSaleRequestDto request)
    {
        if (request.Items == null || !request.Items.Any())
            throw new ArgumentException("A sale must contain at least one item.");

        var productIds = request.Items.Select(i => i.ProductId).ToList();
        var products = await _context.Products
            .Where(p => productIds.Contains(p.Id) && p.IsActive)
            .ToListAsync();

        if (products.Count != productIds.Count)
            throw new InvalidOperationException("One or more products are invalid or inactive.");

        using var transaction = await _context.Database.BeginTransactionAsync();

        var sale = new Sale
        {
            CreatedAt = DateTime.UtcNow,
            TotalAmount = 0
        };

        _context.Sales.Add(sale);
        await _context.SaveChangesAsync();

        var saleItems = new List<SaleItem>();
        decimal totalAmount = 0;

        foreach (var item in request.Items)
        {
            var product = products.First(p => p.Id == item.ProductId);

            if (product.StockQuantity < item.Quantity)
                throw new InvalidOperationException($"Not enough stock for product {product.Name}.");

            var lineTotal = product.Price * item.Quantity;
            totalAmount += lineTotal;

            saleItems.Add(new SaleItem
            {
                SaleId = sale.Id,
                ProductId = product.Id,
                Quantity = item.Quantity,
                UnitPrice = product.Price,
                LineTotal = lineTotal
            });

            product.StockQuantity -= item.Quantity;
        }

        sale.TotalAmount = totalAmount;
        _context.SaleItems.AddRange(saleItems);
        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return new CreateSaleResponseDto
        {
            SaleId = sale.Id,
            CreatedAt = sale.CreatedAt,
            TotalAmount = sale.TotalAmount,
            Items = saleItems.Select(si => new SaleItemResponseDto
            {
                ProductId = si.ProductId,
                ProductName = products.First(p => p.Id == si.ProductId).Name,
                UnitPrice = si.UnitPrice,
                Quantity = si.Quantity,
                LineTotal = si.LineTotal
            }).ToList()
        };
    }

    public async Task<SaleResponseDto?> GetSaleByIdAsync(int saleId)
    {
        var sale = await _context.Sales
            .Include(s => s.SaleItems)
            .ThenInclude(si => si.Product)
            .FirstOrDefaultAsync(s => s.Id == saleId);

        if (sale == null) return null;

        return new SaleResponseDto
        {
            SaleId = sale.Id,
            CreatedAt = sale.CreatedAt,
            TotalAmount = sale.TotalAmount,
            Items = sale.SaleItems.Select(si => new SaleItemResponseDto
            {
                ProductId = si.ProductId,
                ProductName = si.Product.Name,
                UnitPrice = si.UnitPrice,
                Quantity = si.Quantity,
                LineTotal = si.LineTotal
            }).ToList()
        };
    }
}