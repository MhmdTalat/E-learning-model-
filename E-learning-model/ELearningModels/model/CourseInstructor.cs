using System.ComponentModel.DataAnnotations.Schema;

namespace ELearningModels.model
{
    /// <summary>Join entity for Course–Instructor many-to-many. Table: CourseInstructor.</summary>
    [Table("CourseInstructor")]
    public class CourseInstructor
    {
        [Column("CoursesCourseID")]
        public int CourseID { get; set; }
        public Course Course { get; set; } = null!;

        [Column("InstructorsInstructorID")]
        public int InstructorID { get; set; }
        public Instructor Instructor { get; set; } = null!;
    }
}
