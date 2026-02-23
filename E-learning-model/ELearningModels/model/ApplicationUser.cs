using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace ELearningModels.model
{
    /// <summary>User entity (Identity). Represents both Students and other roles. Students are linked via Enrollments.</summary>
    public class ApplicationUser : IdentityUser<int>
    {
        [Required, StringLength(50)]
        public string LastName { get; set; } = null!;

        [Required, StringLength(50)]
        public string FirstMidName { get; set; } = null!;

        [Required]
        public DateTime EnrollmentDate { get; set; }

        [Required]
        public UserRoleType RoleType { get; set; }

        // Profile Fields
        [StringLength(500)]
        public string? Bio { get; set; }

        public string? ProfilePhotoUrl { get; set; }

        public DateTime? DateOfBirth { get; set; }

        [StringLength(200)]
        public string? Address { get; set; }

        [StringLength(20)]
        public new string? PhoneNumber { get; set; }

        [StringLength(100)]
        public string? Company { get; set; }

        public int? DepartmentID { get; set; }
        public virtual Department? Department { get; set; }

        // Refresh Token Management
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        // Relationships
        public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    }
}

