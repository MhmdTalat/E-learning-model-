using System.ComponentModel.DataAnnotations;

namespace ELearningModels.DTO
{
    /// <summary>DTO for assigning an instructor to a student.</summary>
    public class AssignInstructorToStudentDto
    {
        [Required]
        public int InstructorID { get; set; }

        [Required]
        public int StudentID { get; set; }
    }
}
