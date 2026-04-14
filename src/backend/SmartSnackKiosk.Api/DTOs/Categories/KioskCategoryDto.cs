namespace SmartSnackKiosk.Api.DTOs.Categories;

public class KioskCategoryDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }
}
