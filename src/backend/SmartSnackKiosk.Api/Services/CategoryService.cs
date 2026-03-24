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
}
