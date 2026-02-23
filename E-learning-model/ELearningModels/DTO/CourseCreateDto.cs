using System.ComponentModel.DataAnnotations;

namespace ELearningModels.DTO
{
    public class CourseCreateDto
    {
        public int CourseID { get; set; }

        [Required, StringLength(100)]
        public string Title { get; set; } = null!;

        public int Credits { get; set; }

        public int DepartmentID { get; set; }
    }
}
