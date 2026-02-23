using System.ComponentModel.DataAnnotations;

namespace ELearningModels.DTO
{
    public class DepartmentCreateDto
    {
        public int DepartmentID { get; set; }

        [Required, StringLength(50)]
        public string Name { get; set; } = null!;

        [Range(0, double.MaxValue)]
        public decimal Budget { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        public int? InstructorID { get; set; }  // يمكن أن يكون null
    }
}
