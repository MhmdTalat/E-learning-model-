
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ELearningModels.DTO
{
    public class InstructorCreateDto
    {
        public int InstructorID { get; set; } // ID to find the instructor
        [Required, StringLength(50)]
        public string LastName { get; set; } = null!;
        [Required, StringLength(50)]
        public string FirstMidName { get; set; } = null!;
        [Required]
        public DateTime HireDate { get; set; }
        public int? DepartmentID { get; set; }
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]  // ← only output, not input
        public string? DepartmentName { get; set; }

        // New fields for account creation
        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Phone]
        public string? PhoneNumber { get; set; }

        [Required, MinLength(6)]
        public string Password { get; set; } = null!;
    }
}
