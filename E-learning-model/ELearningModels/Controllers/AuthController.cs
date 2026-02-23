using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ELearningModels.DTO;
using ELearningModels.Iservice;

namespace ELearningModels.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                var result = await _authService.GetCurrentUserAsync(userId);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error: {ex.Message}" });
            }
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto? dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid request body. Send JSON with FirstMidName, LastName, Email, PhoneNumber, Password, RoleType (1=Student, 2=Instructor, 3=Admin), and DepartmentID for instructors." });

            if (!ModelState.IsValid)
            {
                var firstError = ModelState.Values.SelectMany(v => v.Errors).FirstOrDefault()?.ErrorMessage;
                return BadRequest(new { message = firstError ?? "Validation failed.", errors = ModelState });
            }
            if (dto.RoleType == 0)
                return BadRequest(new { message = "RoleType is required. Use 1=Student, 2=Instructor, 3=Admin." });

            try
            {
                var result = await _authService.RegisterAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = errorMessage, error = ex.Message });
            }
        }

        /// <summary>Register with profile photo (multipart/form-data).</summary>
        [HttpPost("register-with-photo")]
        public async Task<IActionResult> RegisterWithPhoto([FromForm] RegisterDto? dto)
        {
            if (dto == null)
                return BadRequest(new { message = "Invalid form. Send FirstMidName, LastName, Email, PhoneNumber, Password, RoleType (1/2/3), DepartmentID for instructors, optional ProfilePhoto." });

            if (!ModelState.IsValid)
            {
                var firstError = ModelState.Values.SelectMany(v => v.Errors).FirstOrDefault()?.ErrorMessage;
                return BadRequest(new { message = firstError ?? "Validation failed.", errors = ModelState });
            }
            if (dto.RoleType == 0)
                return BadRequest(new { message = "RoleType is required. Use 1=Student, 2=Instructor, 3=Admin." });

            try
            {
                var result = await _authService.RegisterAsync(dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex) when (ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                var errorMessage = ex.InnerException?.Message ?? ex.Message;
                return BadRequest(new { message = errorMessage, error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var result = await _authService.LoginAsync(dto);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
        [HttpPost("logout")]
        [Authorize]
        public IActionResult Logout()
        {
            // Since JWT is stateless, just tell client to delete the token
            return Ok(new { message = "Logout successful. Please remove token on client." });
        }

        /// <summary>Refresh expired access token using refresh token</summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Token) || string.IsNullOrWhiteSpace(dto.RefreshToken))
                    return BadRequest(new { message = "Token and RefreshToken are required" });

                var result = await _authService.RefreshTokenAsync(dto.Token, dto.RefreshToken);
                return Ok(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(new { message = "Email is required" });

                var token = await _authService.ForgotPasswordAsync(dto.Email);
                return Ok(new { token, email = dto.Email });
            }
            catch (InvalidOperationException ex)
            {
                // Email not found - return 404 but don't reveal that the email doesn't exist (security)
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ForgotPassword Error] {ex.Message}");
                Console.WriteLine($"[ForgotPassword Stack] {ex.StackTrace}");
                return BadRequest(new { message = ex.Message, error = ex.InnerException?.Message ?? "Unknown error" });
            }
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Email))
                    return BadRequest(new { message = "Email is required" });
                if (string.IsNullOrWhiteSpace(dto.Token))
                    return BadRequest(new { message = "Reset token is required" });
                if (string.IsNullOrWhiteSpace(dto.NewPassword))
                    return BadRequest(new { message = "New password is required" });

                await _authService.ResetPasswordAsync(dto);
                return Ok(new { message = "Password reset successfully." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ResetPassword Error] {ex.Message}");
                Console.WriteLine($"[ResetPassword Stack] {ex.StackTrace}");
                return BadRequest(new { message = ex.Message, error = ex.InnerException?.Message ?? "Password reset failed" });
            }
        }

        /// <summary>Update user profile (supports both JSON and FormData with photo)</summary>
        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromForm] UpdateProfileDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { message = "User ID not found in token" });

                var result = await _authService.UpdateProfileAsync(userId, dto);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[UpdateProfile Error] {ex.Message}");
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}