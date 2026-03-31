namespace SmartSnackKiosk.Api.Helpers;

public static class StockStatusHelper
{
    public const int LowStockThreshold = 3;

    public static string GetStockStatus(int stockQuantity)
    {
        if (stockQuantity == 0)
            return "Slut i lager";

        if (stockQuantity <= LowStockThreshold)
            return "Lågt lager";

        return "I lager";
    }
}
