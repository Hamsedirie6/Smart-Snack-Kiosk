using Microsoft.AspNetCore.Mvc;
using SmartSnackKiosk.Api.DTOs.Products;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var createdProduct = await _productService.CreateAsync(productCreateDto);
        if (createdProduct is null)
        {
            ModelState.AddModelError(nameof(productCreateDto.CategoryId), "Angiven kategori finns inte.");
            return ValidationProblem(ModelState);
        }

        return CreatedAtAction(nameof(GetProduct), new { id = createdProduct.Id }, createdProduct);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductResponseDto>> UpdateProduct(int id, ProductUpdateDto productUpdateDto)
    {
        var existingProduct = await _productService.GetByIdAsync(id);
        if (existingProduct is null)
        {
            return NotFound();
        }

        var updatedProduct = await _productService.UpdateAsync(id, productUpdateDto);
        if (updatedProduct is null)
        {
            ModelState.AddModelError(nameof(productUpdateDto.CategoryId), "Angiven kategori finns inte.");
            return ValidationProblem(ModelState);
        }

        return Ok(updatedProduct);
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

    [HttpGet("kiosk")]
    public async Task<ActionResult<IEnumerable<KioskProductDto>>> GetKioskProducts()
    {
        var products = await _productService.GetKioskProductsAsync();
        return Ok(products);
    }
}
