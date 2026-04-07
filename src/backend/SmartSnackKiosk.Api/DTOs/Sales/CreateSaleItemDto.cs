using System.ComponentModel.DataAnnotations;

namespace SmartSnackKiosk.Api.DTOs.Sales;

public class CreateSaleItemDto
{
    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "ProductId måste vara ett positivt heltal.")]
    public int ProductId { get; set; }

    [Required]
    [Range(1, 999, ErrorMessage = "Quantity måste vara mellan 1 och 999.")]
    public int Quantity { get; set; }
}