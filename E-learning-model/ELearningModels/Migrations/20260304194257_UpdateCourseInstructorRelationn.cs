using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELearningModels.Migrations
{
    /// <inheritdoc />
    public partial class UpdateCourseInstructorRelationn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AdvisorInstructorID",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUsers_AdvisorInstructorID",
                table: "AspNetUsers",
                column: "AdvisorInstructorID");

            migrationBuilder.AddForeignKey(
                name: "FK_AspNetUsers_Instructors_AdvisorInstructorID",
                table: "AspNetUsers",
                column: "AdvisorInstructorID",
                principalTable: "Instructors",
                principalColumn: "InstructorID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AspNetUsers_Instructors_AdvisorInstructorID",
                table: "AspNetUsers");

            migrationBuilder.DropIndex(
                name: "IX_AspNetUsers_AdvisorInstructorID",
                table: "AspNetUsers");

            migrationBuilder.DropColumn(
                name: "AdvisorInstructorID",
                table: "AspNetUsers");
        }
    }
}
