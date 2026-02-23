using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELearningModels.Migrations
{
    /// <inheritdoc />
    public partial class AddInstructorEmailColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Instructors_InstructorID",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_InstructorID",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "InstructorID",
                table: "Courses");

            migrationBuilder.AddColumn<string>(
                name: "Email",
                table: "Instructors",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Password",
                table: "Instructors",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PhoneNumber",
                table: "Instructors",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Email",
                table: "Instructors");

            migrationBuilder.DropColumn(
                name: "Password",
                table: "Instructors");

            migrationBuilder.DropColumn(
                name: "PhoneNumber",
                table: "Instructors");

            migrationBuilder.AddColumn<int>(
                name: "InstructorID",
                table: "Courses",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Courses_InstructorID",
                table: "Courses",
                column: "InstructorID");

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Instructors_InstructorID",
                table: "Courses",
                column: "InstructorID",
                principalTable: "Instructors",
                principalColumn: "InstructorID");
        }
    }
}
