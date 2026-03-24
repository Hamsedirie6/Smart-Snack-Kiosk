using SmartSnackKiosk.Api.DTOs.Products;

namespace SmartSnackKiosk.Api.Services.Interfaces;

public interface IProductService
{
    Task<IEnumerable<ProductResponseDto>> GetAllAsync();
    Task<ProductResponseDto?> GetByIdAsync(int id);
    Task<ProductResponseDto?> CreateAsync(ProductCreateDto productCreateDto);
    Task<ProductResponseDto?> UpdateAsync(int id, ProductUpdateDto productUpdateDto);
    Task<ProductResponseDto?> DeactivateAsync(int id);
    Task<IEnumerable<KioskProductDto>> GetKioskProductsAsync();
}
