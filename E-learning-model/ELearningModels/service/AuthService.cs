using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ELearningModels.DTO;
using ELearningModels.Iservice;
using ELearningModels.model;

namespace ELearningModels.service
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IInstructorService _instructorService;
        private readonly string _uploadsPath;

        public AuthService(UserManager<ApplicationUser> userManager,
                           ITokenService tokenService,
                           IInstructorService instructorService)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _instructorService = instructorService;

            // Set up uploads directory
            _uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "uploads", "profiles");
            if (!Directory.Exists(_uploadsPath))
            {
                Directory.CreateDirectory(_uploadsPath);
            }
        }

        private async Task<string?> SaveProfilePhotoAsync(IFormFile? file)
        {
            if (file == null || file.Length == 0)
                return null;

            try
            {
                // Validate file
                if (file.Length > 5 * 1024 * 1024) // 5MB limit
                    throw new Exception("File size exceeds 5MB limit");

                if (!file.ContentType.StartsWith("image/"))
                    throw new Exception("File must be an image");

                // Generate unique filename
                var uniqueFileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
                var filePath = Path.Combine(_uploadsPath, uniqueFileName);

                // Save file
                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(fileStream);
                }

                // Return relative URL path
                return $"/uploads/profiles/{uniqueFileName}";
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Profile Photo Upload Error] {ex.Message}");
                return null;
            }
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            // Handle file upload first
            string? profilePhotoUrl = null;
            if (dto.ProfilePhoto != null)
            {
                profilePhotoUrl = await SaveProfilePhotoAsync(dto.ProfilePhoto);
            }

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                FirstMidName = dto.FirstMidName,
                LastName = dto.LastName,
                EnrollmentDate = DateTime.UtcNow,
                RoleType = dto.RoleType,
                // Profile fields
                Bio = dto.Bio,
                ProfilePhotoUrl = profilePhotoUrl ?? dto.ProfilePhotoUrl,
                DateOfBirth = dto.DateOfBirth,
                Address = dto.Address,
                Company = dto.Company
            };

            // Check if email is already registered (avoid generic Identity message)
            var existingByEmail = await _userManager.FindByEmailAsync(dto.Email);
            if (existingByEmail != null)
                throw new InvalidOperationException("An account with this email already exists. Sign in or use a different email.");

            // 1️⃣ إنشاء المستخدم
            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
            {
                var isDuplicate = result.Errors.Any(e =>
                    string.Equals(e.Code, "DuplicateUserName", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(e.Code, "DuplicateEmail", StringComparison.OrdinalIgnoreCase));
                if (isDuplicate)
                    throw new InvalidOperationException("An account with this email already exists. Sign in or use a different email.");
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
            }

            // 2️⃣ إضافة المستخدم للـ role بعد التأكد إن مش موجود مسبقًا
            var roleName = dto.RoleType.ToString();
            if (!await _userManager.IsInRoleAsync(user, roleName))
            {
                await _userManager.AddToRoleAsync(user, roleName);
            }

            // 3️⃣ إذا كان المستخدم Instructor، أنشئ سجل Instructor
            if (dto.RoleType == UserRoleType.Instructor)
            {
                if (dto.DepartmentID == null)
                    throw new Exception("Department is required for instructors.");

                var instructorDto = new InstructorCreateDto
                {
                    FirstMidName = dto.FirstMidName,
                    LastName = dto.LastName,
                    Email = dto.Email,
                    PhoneNumber = dto.PhoneNumber,
                    HireDate = DateTime.UtcNow,
                    DepartmentID = dto.DepartmentID,
                    Password = dto.Password
                };
                await _instructorService.CreateAsync(instructorDto);
            }

            // 4️⃣ Create tokens
            var accessToken = await _tokenService.CreateTokenAsync(user);
            var refreshToken = _tokenService.CreateRefreshToken();

            // Save refresh token to database
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // 7 days
            await _userManager.UpdateAsync(user);

            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(15),
                ExpiresIn = 900, // 15 minutes in seconds
                User = new UserInfoDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email ?? "",
                    FirstMidName = user.FirstMidName ?? "",
                    LastName = user.LastName ?? "",
                    Role = dto.RoleType.ToString(),
                    Bio = user.Bio,
                    ProfilePhotoUrl = user.ProfilePhotoUrl,
                    DateOfBirth = user.DateOfBirth,
                    Address = user.Address,
                    PhoneNumber = user.PhoneNumber,
                    Company = user.Company
                }
            };
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, dto.Password))
                throw new UnauthorizedAccessException("Invalid credentials");

            var accessToken = await _tokenService.CreateTokenAsync(user);
            var refreshToken = _tokenService.CreateRefreshToken();

            // Save refresh token to database
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7); // 7 days
            await _userManager.UpdateAsync(user);

            var role = user.RoleType.ToString();

            return new AuthResponseDto
            {
                Token = accessToken,
                RefreshToken = refreshToken,
                Expiration = DateTime.UtcNow.AddMinutes(15),
                ExpiresIn = 900, // 15 minutes in seconds
                User = new UserInfoDto
                {
                    Id = user.Id.ToString(),
                    Email = user.Email ?? "",
                    FirstMidName = user.FirstMidName ?? "",
                    LastName = user.LastName ?? "",
                    Role = role,
                    Bio = user.Bio,
                    ProfilePhotoUrl = user.ProfilePhotoUrl,
                    DateOfBirth = user.DateOfBirth,
                    Address = user.Address,
                    PhoneNumber = user.PhoneNumber,
                    Company = user.Company
                }
            };
        }

        public async Task<RefreshTokenResponseDto> RefreshTokenAsync(string token, string refreshToken)
        {
            try
            {
                // Find user by refresh token
                var user = await _userManager.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
                if (user == null)
                    throw new UnauthorizedAccessException("Invalid refresh token");

                // Check if refresh token has expired
                if (user.RefreshTokenExpiryTime == null || user.RefreshTokenExpiryTime < DateTime.UtcNow)
                    throw new UnauthorizedAccessException("Refresh token has expired");

                // Generate new access token
                var newAccessToken = await _tokenService.CreateTokenAsync(user);

                // Optionally generate new refresh token (rotating refresh tokens pattern)
                var newRefreshToken = _tokenService.CreateRefreshToken();
                user.RefreshToken = newRefreshToken;
                user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
                await _userManager.UpdateAsync(user);

                return new RefreshTokenResponseDto
                {
                    Token = newAccessToken,
                    RefreshToken = newRefreshToken,
                    Expiration = DateTime.UtcNow.AddMinutes(15),
                    ExpiresIn = 900
                };
            }
            catch (Exception ex)
            {
                throw new UnauthorizedAccessException($"Token refresh failed: {ex.Message}");
            }
        }

        public async Task<string> ForgotPasswordAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
                throw new InvalidOperationException("No account found with this email.");
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            return token;
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                throw new InvalidOperationException("No account found with this email.");
            var result = await _userManager.ResetPasswordAsync(user, dto.Token, dto.NewPassword);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        public async Task<dynamic> GetCurrentUserAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "Student";

            return new
            {
                id = user.Id,
                userName = user.UserName,
                name = $"{user.FirstMidName} {user.LastName}".Trim(),
                email = user.Email,
                firstName = user.FirstMidName,
                lastName = user.LastName,
                phoneNumber = user.PhoneNumber,
                enrollmentDate = user.EnrollmentDate,
                role = role,
                roleType = user.RoleType,
                bio = user.Bio,
                profilePhotoUrl = user.ProfilePhotoUrl,
                dateOfBirth = user.DateOfBirth,
                address = user.Address,
                company = user.Company
            };
        }

        public async Task<dynamic> UpdateProfileAsync(string userId, UpdateProfileDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                throw new InvalidOperationException("User not found");

            // Handle profile photo upload if provided
            if (dto.ProfilePhoto != null)
            {
                var photoUrl = await SaveProfilePhotoAsync(dto.ProfilePhoto);
                if (photoUrl != null)
                {
                    user.ProfilePhotoUrl = photoUrl;
                }
            }

            // Update fields only if provided
            if (!string.IsNullOrWhiteSpace(dto.FirstMidName))
                user.FirstMidName = dto.FirstMidName;

            if (!string.IsNullOrWhiteSpace(dto.LastName))
                user.LastName = dto.LastName;

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                // Check if email is changing and if new email is already taken
                if (dto.Email != user.Email)
                {
                    var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                    if (existingUser != null && existingUser.Id != user.Id)
                        throw new InvalidOperationException("Email is already in use");

                    user.Email = dto.Email;
                    user.UserName = dto.Email;
                }
            }

            if (dto.PhoneNumber != null)
                user.PhoneNumber = dto.PhoneNumber;

            if (dto.Bio != null)
                user.Bio = dto.Bio;

            if (dto.DateOfBirth.HasValue)
                user.DateOfBirth = dto.DateOfBirth;

            if (dto.Address != null)
                user.Address = dto.Address;

            if (dto.Company != null)
                user.Company = dto.Company;

            // Update user in database
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            // Return updated user data
            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "Student";

            return new
            {
                id = user.Id,
                userName = user.UserName,
                name = $"{user.FirstMidName} {user.LastName}".Trim(),
                email = user.Email,
                firstName = user.FirstMidName,
                lastName = user.LastName,
                phoneNumber = user.PhoneNumber,
                enrollmentDate = user.EnrollmentDate,
                role = role,
                roleType = user.RoleType,
                bio = user.Bio,
                profilePhotoUrl = user.ProfilePhotoUrl,
                dateOfBirth = user.DateOfBirth,
                address = user.Address,
                company = user.Company
            };
        }
    }
}
