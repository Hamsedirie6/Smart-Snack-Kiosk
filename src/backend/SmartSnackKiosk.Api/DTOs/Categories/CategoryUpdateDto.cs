using System.ComponentModel.DataAnnotations;

namespace SmartSnackKiosk.Api.DTOs.Categories;

public class CategoryUpdateDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
}
