namespace ELearningModels.DTO
{
    public class RefreshTokenDto
    {
        public string Token { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }

    public class RefreshTokenResponseDto
    {
        public string Token { get; set; } = null!;
        public string? RefreshToken { get; set; }
        public DateTime Expiration { get; set; }
        public int ExpiresIn { get; set; }
    }
}
