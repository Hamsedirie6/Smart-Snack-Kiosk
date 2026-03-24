using Microsoft.EntityFrameworkCore;
using SmartSnackKiosk.Api.Data;
using SmartSnackKiosk.Api.DTOs.Products;
using SmartSnackKiosk.Api.Entities;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<ProductResponseDto>> GetAllAsync()
    {
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .OrderBy(product => product.Name)
            .Select(product => MapToProductResponseDto(product))
            .ToListAsync();
    }

    public async Task<ProductResponseDto?> GetByIdAsync(int id)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Where(product => product.Id == id)
            .Select(product => MapToProductResponseDto(product))
            .FirstOrDefaultAsync();
    }

    public async Task<ProductResponseDto?> CreateAsync(ProductCreateDto productCreateDto)
    {
        var categoryExists = await CategoryExistsAsync(productCreateDto.CategoryId);
        if (!categoryExists)
        {
            return null;
        }

        var product = new Product
        {
            Name = productCreateDto.Name.Trim(),
            Description = string.IsNullOrWhiteSpace(productCreateDto.Description)
                ? null
                : productCreateDto.Description.Trim(),
            Price = productCreateDto.Price,
            StockQuantity = productCreateDto.StockQuantity,
            CategoryId = productCreateDto.CategoryId,
            ImageUrl = string.IsNullOrWhiteSpace(productCreateDto.ImageUrl)
                ? null
                : productCreateDto.ImageUrl.Trim(),
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id);
    }

    public async Task<ProductResponseDto?> UpdateAsync(int id, ProductUpdateDto productUpdateDto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
        {
            return null;
        }

        var categoryExists = await CategoryExistsAsync(productUpdateDto.CategoryId);
        if (!categoryExists)
        {
            return null;
        }

        product.Name = productUpdateDto.Name.Trim();
        product.Description = string.IsNullOrWhiteSpace(productUpdateDto.Description)
            ? null
            : productUpdateDto.Description.Trim();
        product.Price = productUpdateDto.Price;
        product.StockQuantity = productUpdateDto.StockQuantity;
        product.CategoryId = productUpdateDto.CategoryId;
        product.ImageUrl = string.IsNullOrWhiteSpace(productUpdateDto.ImageUrl)
            ? null
            : productUpdateDto.ImageUrl.Trim();
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id);
    }

    public async Task<ProductResponseDto?> DeactivateAsync(int id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product is null)
        {
            return null;
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return await GetByIdAsync(product.Id);
    }

    public async Task<IEnumerable<KioskProductDto>> GetKioskProductsAsync()
    {
        return await _context.Products
            .AsNoTracking()
            .Include(product => product.Category)
            .Where(product => product.IsActive && product.StockQuantity > 0)
            .OrderBy(product => product.Name)
            .Select(product => new KioskProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                ImageUrl = product.ImageUrl,
                CategoryName = product.Category.Name,
                StockQuantity = product.StockQuantity
            })
            .ToListAsync();
    }

    private async Task<bool> CategoryExistsAsync(int categoryId)
    {
        return await _context.Categories.AnyAsync(category => category.Id == categoryId);
    }

    private static ProductResponseDto MapToProductResponseDto(Product product)
    {
        return new ProductResponseDto
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price = product.Price,
            StockQuantity = product.StockQuantity,
            CategoryId = product.CategoryId,
            CategoryName = product.Category.Name,
            ImageUrl = product.ImageUrl,
            IsActive = product.IsActive
        };
    }
}
