using SmartSnackKiosk.Api.DTOs.Inventory;

namespace SmartSnackKiosk.Api.Services.Interfaces;

public interface IInventoryService
{
    Task<IEnumerable<InventoryProductDto>> GetInventoryOverviewAsync();
    Task<IEnumerable<LowStockProductDto>> GetLowStockProductsAsync();
    Task<InventoryProductDto?> UpdateStockAsync(int productId, UpdateStockDto updateStockDto);
}
