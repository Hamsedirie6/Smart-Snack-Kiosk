namespace SmartSnackKiosk.Api.DTOs.Products;

public class KioskProductDto
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }

    public string? ImageUrl { get; set; }

    public string CategoryName { get; set; } = string.Empty;

    public int StockQuantity { get; set; }
}
