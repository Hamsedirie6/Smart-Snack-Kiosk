using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartSnackKiosk.Api.DTOs.Categories;
using SmartSnackKiosk.Api.Services.Interfaces;

namespace SmartSnackKiosk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryResponseDto>>> GetCategories()
    {
        var categories = await _categoryService.GetAllAsync();
        return Ok(categories);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> GetCategory(int id)
    {
        var category = await _categoryService.GetByIdAsync(id);
        if (category is null)
        {
            return NotFound();
        }

        return Ok(category);
    }

    [HttpGet("kiosk")]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<KioskCategoryDto>>> GetKioskCategories()
    {
        var categories = await _categoryService.GetKioskAsync();
        return Ok(categories);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryResponseDto>> CreateCategory(CategoryCreateDto categoryCreateDto)
    {
        var createdCategory = await _categoryService.CreateAsync(categoryCreateDto);
        return CreatedAtAction(nameof(GetCategory), new { id = createdCategory.Id }, createdCategory);
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<CategoryResponseDto>> UpdateCategory(int id, CategoryUpdateDto categoryUpdateDto)
    {
        var updatedCategory = await _categoryService.UpdateAsync(id, categoryUpdateDto);
        if (updatedCategory is null)
        {
            return NotFound();
        }

        return Ok(updatedCategory);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var result = await _categoryService.DeleteAsync(id);

        if (result is null)
        {
            return NotFound();
        }

        if (result == false)
        {
            return Conflict(new { error = "Kategorin kan inte tas bort eftersom den har produkter kopplade till sig." });
        }

        return NoContent();
    }
}
