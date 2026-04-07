using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSnackKiosk.Api.DTOs.Products;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductResponseDto>>> GetProducts()
    {
        var products = await _productService.GetAllAsync();
        return Ok(products);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> GetProduct(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        if (product is null)
        {
            return NotFound();
        }

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<ProductResponseDto>> CreateProduct(ProductCreateDto productCreateDto)
    {
        try
        {
            var createdProduct = await _productService.CreateAsync(productCreateDto);
            return CreatedAtAction(nameof(GetProduct), new { id = createdProduct!.Id }, createdProduct);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError(nameof(productCreateDto.CategoryId), ex.Message);
            return ValidationProblem(ModelState);
        }
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> UpdateProduct(int id, ProductUpdateDto productUpdateDto)
    {
        var existingProduct = await _productService.GetByIdAsync(id);
        if (existingProduct is null)
        {
            return NotFound();
        }

        try
        {
            var updatedProduct = await _productService.UpdateAsync(id, productUpdateDto);
            return Ok(updatedProduct);
        }
        catch (ArgumentException ex)
        {
            ModelState.AddModelError(nameof(productUpdateDto.CategoryId), ex.Message);
            return ValidationProblem(ModelState);
        }
    }

    [HttpPatch("{id:int}/deactivate")]
    public async Task<ActionResult<ProductResponseDto>> DeactivateProduct(int id)
    {
        var deactivatedProduct = await _productService.DeactivateAsync(id);
        if (deactivatedProduct is null)
        {
            return NotFound();
        }

        return Ok(deactivatedProduct);
    }

    [HttpPatch("{id:int}/reactivate")]
    public async Task<ActionResult<ProductResponseDto>> ReactivateProduct(int id)
    {
        var reactivatedProduct = await _productService.ReactivateAsync(id);
        if (reactivatedProduct is null)
        {
            return NotFound();
        }

        return Ok(reactivatedProduct);
    }

    [HttpGet("kiosk")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<KioskProductDto>>> GetKioskProducts()
    {
        var products = await _productService.GetKioskProductsAsync();
        return Ok(products);
    }
}
