using Microsoft.EntityFrameworkCore;
using SmartSnackKiosk.Api.Data;
using SmartSnackKiosk.Api.DTOs.Inventory;
using SmartSnackKiosk.Api.Entities;
using SmartSnackKiosk.Api.Helpers;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Services;

public class InventoryService : IInventoryService
{
    private readonly AppDbContext _context;

    public InventoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<InventoryProductDto>> GetInventoryOverviewAsync()
    {
        var products = await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .OrderBy(product => product.Name)
            .ToListAsync();

        return products.Select(MapToInventoryProductDto);
    }

    public async Task<IEnumerable<LowStockProductDto>> GetLowStockProductsAsync()
    {
        // Ladda entiteter till minnet innan mappning – GetStockStatus är en C#-metod
        // som EF Core inte kan översätta till SQL
        var products = await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Where(product => product.StockQuantity <= StockStatusHelper.LowStockThreshold)
            .OrderBy(product => product.StockQuantity)
            .ThenBy(product => product.Name)
            .ToListAsync();

        return products.Select(product => new LowStockProductDto
        {
            ProductId = product.Id,
            ProductName = product.Name,
            StockQuantity = product.StockQuantity,
            CategoryName = product.Category.Name,
            StockStatus = StockStatusHelper.GetStockStatus(product.StockQuantity)
        });
    }

    public async Task<InventoryProductDto?> UpdateStockAsync(int productId, UpdateStockDto updateStockDto)
    {
        var product = await _context.Products
            .Include(existingProduct => existingProduct.Category)
            .FirstOrDefaultAsync(existingProduct => existingProduct.Id == productId);

        if (product is null)
        {
            return null;
        }

        product.StockQuantity = updateStockDto.NewQuantity;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return MapToInventoryProductDto(product);
    }

    private static InventoryProductDto MapToInventoryProductDto(Product product)
    {
        return new InventoryProductDto
        {
            Id = product.Id,
            Name = product.Name,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name,
            IsActive = product.IsActive,
            StockStatus = StockStatusHelper.GetStockStatus(product.StockQuantity)
        };
    }
}
