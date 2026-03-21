using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StudentDataAccessLayer.Migrations
{
    /// <inheritdoc />
    public partial class AddClassroomIdToAttendance : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ClassroomId",
                table: "Attendances",
                type: "int",
                nullable: true);

            migrationBuilder.Sql(@"
                UPDATE a SET a.ClassroomId = s.ClassroomId
                FROM Attendances a
                INNER JOIN Students s ON a.StudentId = s.Id
                WHERE a.ClassroomId IS NULL;
            ");

            migrationBuilder.AlterColumn<int>(
                name: "ClassroomId",
                table: "Attendances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Attendances_ClassroomId",
                table: "Attendances",
                column: "ClassroomId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attendances_Classrooms_ClassroomId",
                table: "Attendances",
                column: "ClassroomId",
                principalTable: "Classrooms",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attendances_Classrooms_ClassroomId",
                table: "Attendances");

            migrationBuilder.DropIndex(
                name: "IX_Attendances_ClassroomId",
                table: "Attendances");

            migrationBuilder.DropColumn(
                name: "ClassroomId",
                table: "Attendances");
        }
    }
}
