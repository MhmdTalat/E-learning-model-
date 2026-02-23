using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ELearningModels.Migrations
{
    /// <inheritdoc />
    public partial class addupdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseInstructor_Courses_CoursesCourseID",
                table: "CourseInstructor");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseInstructor_Instructors_InstructorsInstructorID",
                table: "CourseInstructor");

            migrationBuilder.RenameColumn(
                name: "InstructorsInstructorID",
                table: "CourseInstructor",
                newName: "InstructorID");

            migrationBuilder.RenameColumn(
                name: "CoursesCourseID",
                table: "CourseInstructor",
                newName: "CourseID");

            migrationBuilder.RenameIndex(
                name: "IX_CourseInstructor_InstructorsInstructorID",
                table: "CourseInstructor",
                newName: "IX_CourseInstructor_InstructorID");

            migrationBuilder.AddColumn<int>(
                name: "InstructorID",
                table: "Courses",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RoleType",
                table: "AspNetUsers",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Courses_InstructorID",
                table: "Courses",
                column: "InstructorID");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseInstructor_Courses_CourseID",
                table: "CourseInstructor",
                column: "CourseID",
                principalTable: "Courses",
                principalColumn: "CourseID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseInstructor_Instructors_InstructorID",
                table: "CourseInstructor",
                column: "InstructorID",
                principalTable: "Instructors",
                principalColumn: "InstructorID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Courses_Instructors_InstructorID",
                table: "Courses",
                column: "InstructorID",
                principalTable: "Instructors",
                principalColumn: "InstructorID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_CourseInstructor_Courses_CourseID",
                table: "CourseInstructor");

            migrationBuilder.DropForeignKey(
                name: "FK_CourseInstructor_Instructors_InstructorID",
                table: "CourseInstructor");

            migrationBuilder.DropForeignKey(
                name: "FK_Courses_Instructors_InstructorID",
                table: "Courses");

            migrationBuilder.DropIndex(
                name: "IX_Courses_InstructorID",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "InstructorID",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "RoleType",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "InstructorID",
                table: "CourseInstructor",
                newName: "InstructorsInstructorID");

            migrationBuilder.RenameColumn(
                name: "CourseID",
                table: "CourseInstructor",
                newName: "CoursesCourseID");

            migrationBuilder.RenameIndex(
                name: "IX_CourseInstructor_InstructorID",
                table: "CourseInstructor",
                newName: "IX_CourseInstructor_InstructorsInstructorID");

            migrationBuilder.AddForeignKey(
                name: "FK_CourseInstructor_Courses_CoursesCourseID",
                table: "CourseInstructor",
                column: "CoursesCourseID",
                principalTable: "Courses",
                principalColumn: "CourseID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_CourseInstructor_Instructors_InstructorsInstructorID",
                table: "CourseInstructor",
                column: "InstructorsInstructorID",
                principalTable: "Instructors",
                principalColumn: "InstructorID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
