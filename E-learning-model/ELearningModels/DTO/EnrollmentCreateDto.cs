using System.ComponentModel.DataAnnotations;

namespace ELearningModels.DTO
{
    public class EnrollmentCreateDto
    {
        public int EnrollmentID { get; set; }

        [Required]
        public int CourseID { get; set; }

        [Required]
        public int StudentID { get; set; }

        [Range(0, 100)]
        public decimal? Grade { get; set; }
    }
}