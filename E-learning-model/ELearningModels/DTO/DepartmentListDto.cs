namespace ELearningModels.DTO
{
    /// <summary>Department list item with relation counts and head name.</summary>
    public class DepartmentListDto
    {
        public int DepartmentID { get; set; }
        public string Name { get; set; } = null!;
        public decimal Budget { get; set; }
        public DateTime StartDate { get; set; }
        public int? InstructorID { get; set; }
        public string? AdministratorName { get; set; }
        public int CourseCount { get; set; }
        public int StudentCount { get; set; }
    }
}
