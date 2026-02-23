using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ELearningModels.model;

namespace ELearningModels.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        { }

        public DbSet<Instructor> Instructors { get; set; } = null!;
        public DbSet<Course> Courses { get; set; } = null!;
        public DbSet<CourseInstructor> CourseInstructor { get; set; } = null!;
        public DbSet<Enrollment> Enrollments { get; set; } = null!;
        public DbSet<Department> Departments { get; set; } = null!;
        public DbSet<OfficeAssignment> OfficeAssignments { get; set; } = null!;
        public DbSet<ApplicationUser> ApplicationUsers { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 1. OfficeAssignment → 1-to-0..1 with Instructor
            builder.Entity<OfficeAssignment>()
                .HasOne(o => o.Instructor)
                .WithOne(i => i.OfficeAssignment)
                .HasForeignKey<OfficeAssignment>(o => o.InstructorID)
                .OnDelete(DeleteBehavior.Cascade);

            // 2. Course ↔ Instructor many-to-many (EXPLICIT JOIN ENTITY)
            builder.Entity<CourseInstructor>()
                .HasKey(ci => new { ci.CourseID, ci.InstructorID });

            builder.Entity<CourseInstructor>()
                .HasOne(ci => ci.Course)
                .WithMany(c => c.CourseInstructors)
                .HasForeignKey(ci => ci.CourseID);

            builder.Entity<CourseInstructor>()
                .HasOne(ci => ci.Instructor)
                .WithMany(i => i.CourseInstructors)
                .HasForeignKey(ci => ci.InstructorID);

            // 3. Instructors who BELONG to a department
            builder.Entity<Instructor>()
                .HasOne(i => i.Department)
                .WithMany(d => d.Instructors)
                .HasForeignKey(i => i.DepartmentID)
                .OnDelete(DeleteBehavior.SetNull);

            // 4. Department Administrator
            builder.Entity<Department>()
                .HasOne(d => d.Administrator)
                .WithMany(i => i.DepartmentsAdministered)
                .HasForeignKey(d => d.InstructorID)
                .OnDelete(DeleteBehavior.SetNull);

            // 5. One enrollment per student per course
            builder.Entity<Enrollment>()
                .HasIndex(e => new { e.StudentID, e.CourseID })
                .IsUnique();

            builder.Entity<ApplicationUser>()
                .HasOne(a => a.Department)
                .WithMany(d => d.Students)
                .HasForeignKey(a => a.DepartmentID)
                .OnDelete(DeleteBehavior.SetNull);
        }

    }
}
