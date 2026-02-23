using System.ComponentModel.DataAnnotations;

namespace ELearningModels.model
{
    /// <summary>Enrollment entity. Links a Student (ApplicationUser) to a Course with an optional Grade.</summary>
    public class Enrollment
    {
        public int EnrollmentID { get; set; }

        public int CourseID { get; set; }
        public Course Course { get; set; } = null!;

        public int StudentID { get; set; }
        public ApplicationUser Student { get; set; } = null!;

        public decimal? Grade { get; set; }

        public DateTime EnrollmentDate { get; set; } = DateTime.UtcNow;
    }
}
