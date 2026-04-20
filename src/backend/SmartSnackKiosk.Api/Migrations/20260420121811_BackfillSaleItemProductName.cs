using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartSnackKiosk.Api.Migrations
{
    /// <inheritdoc />
    public partial class BackfillSaleItemProductName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Kopiera produktnamnet från Products till befintliga SaleItems-rader
            // som saknar ProductName (skapade innan kolumnen lades till).
            migrationBuilder.Sql(@"
                UPDATE SaleItems si
                JOIN Products p ON si.ProductId = p.Id
                SET si.ProductName = p.Name
                WHERE si.ProductName = '' OR si.ProductName IS NULL;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
