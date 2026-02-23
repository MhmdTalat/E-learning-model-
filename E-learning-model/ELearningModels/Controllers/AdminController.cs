using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ELearningModels.model;

namespace ELearningModels.Controllers
{
    [Route("api/admin")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminController(UserManager<ApplicationUser> userManager)
        {
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllAdmins()
        {
            var admins = await _userManager.Users
                .Where(u => u.RoleType == UserRoleType.Admin)
                .Select(u => new
                {
                    id = u.Id,
                    email = u.Email,
                    firstName = u.FirstMidName,
                    lastName = u.LastName,
                    role = u.RoleType.ToString(),
                    enrollmentDate = u.EnrollmentDate,
                    profilePhotoUrl = u.ProfilePhotoUrl
                })
                .ToListAsync();

            return Ok(admins);
        }

        [HttpGet("role/{roleId}")]
        public async Task<IActionResult> GetByRoleId(int roleId)
        {
            if (!Enum.IsDefined(typeof(UserRoleType), roleId))
                return BadRequest(new { message = "Invalid roleId" });

            var role = (UserRoleType)roleId;

            var users = await _userManager.Users
                .Where(u => u.RoleType == role)
                .Select(u => new
                {
                    id = u.Id,
                    email = u.Email,
                    firstName = u.FirstMidName,
                    lastName = u.LastName,
                    role = u.RoleType.ToString(),
                    enrollmentDate = u.EnrollmentDate,
                    profilePhotoUrl = u.ProfilePhotoUrl
                })
                .ToListAsync();

            return Ok(users);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
                return NotFound(new { message = "Admin not found" });

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? user.RoleType.ToString();

            return Ok(new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstMidName,
                lastName = user.LastName,
                role = role,
                roleType = user.RoleType,
                enrollmentDate = user.EnrollmentDate,
                profilePhotoUrl = user.ProfilePhotoUrl
            });
        }

        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
                return NotFound(new { message = "Admin not found" });

            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return BadRequest(new { message = "Failed to delete admin", errors = result.Errors });

            return Ok(new { message = "Admin deleted successfully" });
        }
    }
}
