namespace SmartSnackKiosk.Api.Entities;

public class SaleItem
{
    public int Id { get; set; }

    public int SaleId { get; set; }

    // Nullable – sätts till null om produkten tas bort.
    // ProductName bevarar namnet även efter borttagning.
    public int? ProductId { get; set; }

    public string ProductName { get; set; } = string.Empty;

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal LineTotal { get; set; }

    public Sale Sale { get; set; } = null!;

    public Product? Product { get; set; }
}
