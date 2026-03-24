namespace SmartSnackKiosk.Api.DTOs.Products;

public class ProductResponseDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public decimal Price { get; set; }

    public int StockQuantity { get; set; }

    public int CategoryId { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public bool IsActive { get; set; }
}
