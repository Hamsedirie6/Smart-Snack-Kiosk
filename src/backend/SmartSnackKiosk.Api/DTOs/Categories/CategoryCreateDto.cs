using System.ComponentModel.DataAnnotations;

namespace SmartSnackKiosk.Api.DTOs.Categories;

public class CategoryCreateDto
{
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = string.Empty;
}
