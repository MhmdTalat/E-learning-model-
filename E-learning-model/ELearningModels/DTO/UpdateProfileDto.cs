using Microsoft.AspNetCore.Http;

namespace ELearningModels.DTO
{
    public class UpdateProfileDto
    {
        public string? FirstMidName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Bio { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? Company { get; set; }
        public int? DepartmentID { get; set; }
        
        // File upload (optional)
        public IFormFile? ProfilePhoto { get; set; }
    }
}
