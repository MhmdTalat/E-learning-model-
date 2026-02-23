using ELearningModels.model;

namespace ELearningModels.Iservice
{
    public interface ITokenService
    {
        /// <summary>Create short-lived access token (15 minutes)</summary>
        Task<string> CreateTokenAsync(ApplicationUser user);

        /// <summary>Create long-lived refresh token (7 days)</summary>
        string CreateRefreshToken();
    }
}
