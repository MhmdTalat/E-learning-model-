using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ELearningModels.model
{
    /// <summary>Department entity. Has an optional administrator (Instructor) and contains courses.</summary>
    public class Department
    {
        public int DepartmentID { get; set; }
        public required string Name { get; set; }

        [Column(TypeName = "money")]
        public decimal Budget { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public int? InstructorID { get; set; }
        public Instructor? Administrator { get; set; }

        public ICollection<Course> Courses { get; set; } = new List<Course>();
        public ICollection<Instructor> Instructors { get; set; } = new List<Instructor>();
        public ICollection<ApplicationUser> Students { get; set; } = new List<ApplicationUser>();
    }
}
