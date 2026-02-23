using ELearningModels.model;
using Microsoft.AspNetCore.Http;

namespace ELearningModels.DTO
{
    public class RegisterDto
    {
        public string FirstMidName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Email { get; set; } = null!;
        /// <summary>Optional. Use null or empty when not provided.</summary>
        public string? PhoneNumber { get; set; }
        public string Password { get; set; } = null!;
        public UserRoleType RoleType { get; set; }
        public int? DepartmentID { get; set; }  // Optional, for instructors

        // Profile fields (optional)
        public string? Bio { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? Company { get; set; }

        // File upload (optional)
        public IFormFile? ProfilePhoto { get; set; }
    }
}
