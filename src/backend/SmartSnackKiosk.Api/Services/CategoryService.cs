using Microsoft.EntityFrameworkCore;
using SmartSnackKiosk.Api.Data;
using SmartSnackKiosk.Api.DTOs.Categories;
using SmartSnackKiosk.Api.Entities;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<CategoryResponseDto>> GetAllAsync()
    {
        return await _context.Categories
            .AsNoTracking()
            .OrderBy(category => category.Name)
            .Select(category => new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                CreatedAt = category.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<CategoryResponseDto?> GetByIdAsync(int id)
    {
        return await _context.Categories
            .AsNoTracking()
            .Where(category => category.Id == id)
            .Select(category => new CategoryResponseDto
            {
                Id = category.Id,
                Name = category.Name,
                CreatedAt = category.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<CategoryResponseDto> CreateAsync(CategoryCreateDto categoryCreateDto)
    {
        var category = new Category
        {
            Name = categoryCreateDto.Name.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            CreatedAt = category.CreatedAt
        };
    }

    public async Task<CategoryResponseDto?> UpdateAsync(int id, CategoryUpdateDto categoryUpdateDto)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category is null)
        {
            return null;
        }

        category.Name = categoryUpdateDto.Name.Trim();
        await _context.SaveChangesAsync();

        return new CategoryResponseDto
        {
            Id = category.Id,
            Name = category.Name,
            CreatedAt = category.CreatedAt
        };
    }

    /// <summary>
    /// Tar bort en kategori.
    /// Returnerar null om kategorin inte finns.
    /// Returnerar false om kategorin har produkter kopplade till sig (kan inte tas bort).
    /// Returnerar true om borttagningen lyckades.
    /// </summary>
    public async Task<bool?> DeleteAsync(int id)
    {
        var category = await _context.Categories
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category is null)
        {
            return null;
        }

        if (category.Products.Any())
        {
            return false;
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return true;
    }
}
