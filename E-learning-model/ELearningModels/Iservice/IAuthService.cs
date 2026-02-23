using ELearningModels.DTO;

namespace ELearningModels.Iservice
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto dto);
        Task<AuthResponseDto> LoginAsync(LoginDto dto);
        Task<RefreshTokenResponseDto> RefreshTokenAsync(string token, string refreshToken);
        Task<string> ForgotPasswordAsync(string email);
        Task ResetPasswordAsync(ResetPasswordDto dto);
        Task<dynamic> GetCurrentUserAsync(string userId);
        Task<dynamic> UpdateProfileAsync(string userId, UpdateProfileDto dto);
    }
}
