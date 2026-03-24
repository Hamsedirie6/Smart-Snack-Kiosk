using Microsoft.EntityFrameworkCore;
using SmartSnackKiosk.Api.Data;
using SmartSnackKiosk.Api.DTOs.Inventory;
using SmartSnackKiosk.Api.Entities;
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
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .OrderBy(product => product.Name)
            .Select(product => MapToInventoryProductDto(product))
            .ToListAsync();
    }

    public async Task<IEnumerable<LowStockProductDto>> GetLowStockProductsAsync()
    {
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Where(product => product.StockQuantity <= 3)
            .OrderBy(product => product.StockQuantity)
            .ThenBy(product => product.Name)
            .Select(product => new LowStockProductDto
            {
                Id = product.Id,
                Name = product.Name,
                StockQuantity = product.StockQuantity,
                CategoryName = product.Category.Name,
                StockStatus = GetStockStatus(product.StockQuantity)
            })
            .ToListAsync();
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
            StockStatus = GetStockStatus(product.StockQuantity)
        };
    }

    private static string GetStockStatus(int stockQuantity)
    {
        if (stockQuantity == 0)
        {
            return "Slut i lager";
        }

        if (stockQuantity <= 3)
        {
            return "L\u00E5gt lager";
        }

        return "I lager";
    }
}
