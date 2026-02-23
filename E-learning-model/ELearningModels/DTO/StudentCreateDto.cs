using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ELearningModels.DTO
{
    public class StudentCreateDto
    {
        public int Id { get; set; }

        [Required, StringLength(50)]
        public string FirstMidName { get; set; } = null!;

        [Required, StringLength(50)]
        public string LastName { get; set; } = null!;

        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        public string? PhoneNumber { get; set; }

        [Required]
        public DateTime EnrollmentDate { get; set; }

        /// <summary>Required for register/create; optional for update (change password).</summary>
        [MinLength(6)]
        public string? Password { get; set; }

        /// <summary>Optional. Department ID for student enrollment.</summary>
        public int? DepartmentID { get; set; }

        /// <summary>Read-only. Department name returned from server.</summary>
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingDefault)]
        public string? DepartmentName { get; set; }
    }
}
