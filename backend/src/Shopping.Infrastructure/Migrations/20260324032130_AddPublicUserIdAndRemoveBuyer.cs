using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shopping.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPublicUserIdAndRemoveBuyer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FullName",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "StoreName",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "PublicUserId",
                table: "AspNetUsers",
                type: "character varying(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_PublicUserId",
                table: "AspNetUsers",
                column: "PublicUserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_PublicUserId",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "PublicUserId",
                table: "AspNetUsers");

            migrationBuilder.AddColumn<string>(
                name: "FullName",
                table: "AspNetUsers",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StoreName",
                table: "AspNetUsers",
                type: "text",
                nullable: true);
        }
    }
}
