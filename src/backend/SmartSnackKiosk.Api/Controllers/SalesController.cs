using Microsoft.AspNetCore.Mvc;
using SmartSnackKiosk.Api.DTOs.Sales;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SalesController : ControllerBase
{
    private readonly ISaleService _saleService;

    public SalesController(ISaleService saleService)
    {
        _saleService = saleService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateSale([FromBody] CreateSaleRequestDto request)
    {
        try
        {
            var response = await _saleService.CreateSaleAsync(request);
            return CreatedAtAction(nameof(GetSaleById), new { id = response.SaleId }, response);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetSaleById(int id)
    {
        var sale = await _saleService.GetSaleByIdAsync(id);
        if (sale == null) return NotFound();
        return Ok(sale);
    }
}