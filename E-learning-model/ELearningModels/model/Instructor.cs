using System.ComponentModel.DataAnnotations;

namespace ELearningModels.model
{
    /// <summary>Instructor entity. Can belong to a department and teach many courses.</summary>
    public class Instructor
    {
        public int InstructorID { get; set; }

        [Required, StringLength(50)]
        public string LastName { get; set; } = null!;

        [Required, StringLength(50)]
        public string FirstMidName { get; set; } = null!;

        [Required]
        public DateTime HireDate { get; set; }

        public int? DepartmentID { get; set; }
        public Department? Department { get; set; }

        // New fields for account creation
        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Phone]
        public string? PhoneNumber { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; } = null!;

        public ICollection<CourseInstructor> CourseInstructors { get; set; }
     = new List<CourseInstructor>();
        public OfficeAssignment? OfficeAssignment { get; set; }
        public ICollection<Department> DepartmentsAdministered { get; set; } = new List<Department>();

        // Relationship: Instructor can mentor/advise many students
        public ICollection<ApplicationUser> AdvisedStudents { get; set; } = new List<ApplicationUser>();
    }
}
