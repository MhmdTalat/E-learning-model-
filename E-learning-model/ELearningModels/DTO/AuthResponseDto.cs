namespace ELearningModels.DTO
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string? RefreshToken { get; set; }
        public DateTime Expiration { get; set; }
        public int ExpiresIn { get; set; } // Token expiration in seconds
        public UserInfoDto? User { get; set; }
    }

    public class UserInfoDto
    {
        public string Id { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string FirstMidName { get; set; } = null!;
        public string LastName { get; set; } = null!;
        public string Role { get; set; } = null!;

        // Profile fields
        public string? Bio { get; set; }
        public string? ProfilePhotoUrl { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Address { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Company { get; set; }
    }
}
