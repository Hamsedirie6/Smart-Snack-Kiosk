using Microsoft.AspNetCore.Mvc;
using SmartSnackKiosk.Api.DTOs.Inventory;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IInventoryService _inventoryService;

    public InventoryController(IInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<InventoryProductDto>>> GetInventoryOverview()
    {
        var products = await _inventoryService.GetInventoryOverviewAsync();
        return Ok(products);
    }

    [HttpGet("low-stock")]
    public async Task<ActionResult<IEnumerable<LowStockProductDto>>> GetLowStockProducts()
    {
        var products = await _inventoryService.GetLowStockProductsAsync();
        return Ok(products);
    }

    [HttpPatch("{productId:int}/stock")]
    public async Task<ActionResult<InventoryProductDto>> UpdateStock(int productId, UpdateStockDto updateStockDto)
    {
        var updatedProduct = await _inventoryService.UpdateStockAsync(productId, updateStockDto);
        if (updatedProduct is null)
        {
            return NotFound();
        }

        return Ok(updatedProduct);
    }
}
