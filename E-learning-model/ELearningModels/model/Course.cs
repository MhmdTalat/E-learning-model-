using System.ComponentModel.DataAnnotations;

namespace ELearningModels.model
{
    /// <summary>Course entity. Belongs to a department; has enrollments and many instructors.</summary>
    public class Course
    {
        public int CourseID { get; set; }

        [Required, StringLength(100)]
        public string Title { get; set; } = null!;

        [Range(0, 10)]
        public int Credits { get; set; }

        public int DepartmentID { get; set; }
        public Department Department { get; set; } = null!;

        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
        public ICollection<CourseInstructor> CourseInstructors { get; set; }
    = new List<CourseInstructor>();
    }
}
