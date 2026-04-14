using SmartSnackKiosk.Api.DTOs.Categories;

namespace SmartSnackKiosk.Api.Services.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryResponseDto>> GetAllAsync();
    Task<CategoryResponseDto?> GetByIdAsync(int id);
    Task<IEnumerable<KioskCategoryDto>> GetKioskAsync();
    Task<CategoryResponseDto> CreateAsync(CategoryCreateDto categoryCreateDto);
    Task<CategoryResponseDto?> UpdateAsync(int id, CategoryUpdateDto categoryUpdateDto);
    Task<bool?> DeleteAsync(int id);
}
