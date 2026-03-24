namespace SmartSnackKiosk.Api.DTOs.Categories;

public class CategoryResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
