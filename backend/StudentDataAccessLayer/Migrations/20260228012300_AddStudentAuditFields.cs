using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentDataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddStudentAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_Subjects_SubjectID",
                table: "Teachers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken");

            migrationBuilder.RenameColumn(
                name: "SubjectID",
                table: "Teachers",
                newName: "SubjectId");

            migrationBuilder.RenameIndex(
                name: "IX_Teachers_SubjectID",
                table: "Teachers",
                newName: "IX_Teachers_SubjectId");

            migrationBuilder.RenameColumn(
                name: "ID",
                table: "Students",
                newName: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken",
                columns: new[] { "Id", "ApplicationUserId" });

            migrationBuilder.CreateIndex(
                name: "IX_RefreshToken_ApplicationUserId",
                table: "RefreshToken",
                column: "ApplicationUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Teachers_Subjects_SubjectId",
                table: "Teachers",
                column: "SubjectId",
                principalTable: "Subjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teachers_Subjects_SubjectId",
                table: "Teachers");

            migrationBuilder.DropPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken");

            migrationBuilder.DropIndex(
                name: "IX_RefreshToken_ApplicationUserId",
                table: "RefreshToken");

            migrationBuilder.RenameColumn(
                name: "SubjectId",
                table: "Teachers",
                newName: "SubjectID");

            migrationBuilder.RenameIndex(
                name: "IX_Teachers_SubjectId",
                table: "Teachers",
                newName: "IX_Teachers_SubjectID");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Students",
                newName: "ID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_RefreshToken",
                table: "RefreshToken",
                columns: new[] { "ApplicationUserId", "Id" });

            migrationBuilder.AddForeignKey(
                name: "FK_Teachers_Subjects_SubjectID",
                table: "Teachers",
                column: "SubjectID",
                principalTable: "Subjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
