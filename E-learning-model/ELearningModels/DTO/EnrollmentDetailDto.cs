using System.ComponentModel.DataAnnotations;

namespace ELearningModels.DTO
{
    /// <summary>
    /// Data Transfer Object for enrollment details including related course and department information.
    /// </summary>
    public class EnrollmentDetailDto
    {
        public int EnrollmentID { get; set; }

        [Required]
        public int CourseID { get; set; }

        [Required]
        public int StudentID { get; set; }

        [Range(0, 100)]
        public decimal? Grade { get; set; }

        public DateTime EnrollmentDate { get; set; }

        // Course related fields
        public string? CourseName { get; set; }
        public int Credits { get; set; }

        // Department related fields
        public int DepartmentID { get; set; }
        public string? DepartmentName { get; set; }

        // Student related fields
        public string? StudentName { get; set; }
        public string? StudentEmail { get; set; }
    }
}
