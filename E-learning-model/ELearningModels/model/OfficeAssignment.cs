using System.ComponentModel.DataAnnotations;

namespace ELearningModels.model
{
    /// <summary>Office assignment. One-to-one with Instructor (optional).</summary>
    public class OfficeAssignment
    {
        [Key]
        public int InstructorID { get; set; }

        [Required, StringLength(100)]
        public string Location { get; set; } = null!;

        public Instructor Instructor { get; set; } = null!;
    }
}
