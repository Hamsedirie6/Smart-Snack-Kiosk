using SmartSnackKiosk.Api.DTOs.Sales;

namespace SmartSnackKiosk.Api.Services.Interfaces;

public interface ISaleService
{
    Task<CreateSaleResponseDto> CreateSaleAsync(CreateSaleRequestDto request);
    Task<SaleResponseDto?> GetSaleByIdAsync(int saleId);
}