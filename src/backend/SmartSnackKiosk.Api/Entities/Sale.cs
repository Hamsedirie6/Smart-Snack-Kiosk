namespace SmartSnackKiosk.Api.Entities;

public class Sale
{
    public int Id { get; set; }

    public decimal TotalAmount { get; set; }

    public DateTime CreatedAt { get; set; }

    public string PaymentStatus { get; set; } = "Completed";

    public ICollection<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
}
