using System.ComponentModel.DataAnnotations;

namespace SmartSnackKiosk.Api.DTOs.Inventory;

public class UpdateStockDto
{
    [Range(0, int.MaxValue)]
    public int NewQuantity { get; set; }
}
