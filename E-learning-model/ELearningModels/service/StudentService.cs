using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ELearningModels.DTO;
using ELearningModels.Iservice;
using ELearningModels.model;
using ELearningModels.Data;

namespace ELearningModels.service
{
    public class StudentService : IStudentService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly AppDbContext _context;

        public StudentService(UserManager<ApplicationUser> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<IEnumerable<StudentCreateDto>> GetAllAsync()
        {
            var students = await _userManager.GetUsersInRoleAsync(nameof(UserRoleType.Student));
            return students.Select(u => MapToDto(u)).ToList();
        }

        public async Task<StudentCreateDto?> GetByIdAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
                return null;
            var isStudent = await _userManager.IsInRoleAsync(user, nameof(UserRoleType.Student));
            if (!isStudent)
                return null;
            return MapToDto(user);
        }

        public async Task<ApplicationUser> CreateAsync(StudentCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Password))
                throw new ArgumentException("Password is required for new student.");

            // Verify department exists if provided
            if (dto.DepartmentID.HasValue && dto.DepartmentID.Value > 0)
            {
                var deptExists = await _context.Departments.AnyAsync(d => d.DepartmentID == dto.DepartmentID);
                if (!deptExists)
                    throw new Exception("Department not found.");
            }

            var user = new ApplicationUser
            {
                UserName = dto.Email,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                FirstMidName = dto.FirstMidName,
                LastName = dto.LastName,
                EnrollmentDate = dto.EnrollmentDate,
                DepartmentID = dto.DepartmentID,
                RoleType = UserRoleType.Student
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

            if (!await _userManager.IsInRoleAsync(user, nameof(UserRoleType.Student)))
                await _userManager.AddToRoleAsync(user, nameof(UserRoleType.Student));

            return user;
        }

        public async Task<StudentCreateDto?> UpdateAsync(StudentCreateDto dto)
        {
            var user = await _userManager.FindByIdAsync(dto.Id.ToString());
            if (user == null)
                return null;

            var isStudent = await _userManager.IsInRoleAsync(user, nameof(UserRoleType.Student));
            if (!isStudent)
                return null;

            // Verify department exists if provided
            if (dto.DepartmentID.HasValue && dto.DepartmentID.Value > 0)
            {
                var deptExists = await _context.Departments.AnyAsync(d => d.DepartmentID == dto.DepartmentID);
                if (!deptExists)
                    throw new Exception("Department not found.");
            }

            user.FirstMidName = dto.FirstMidName;
            user.LastName = dto.LastName;
            user.Email = dto.Email;
            user.UserName = dto.Email;
            user.NormalizedEmail = _userManager.NormalizeEmail(dto.Email);
            user.NormalizedUserName = _userManager.NormalizeName(dto.Email);
            user.PhoneNumber = dto.PhoneNumber;
            user.EnrollmentDate = dto.EnrollmentDate;
            user.DepartmentID = dto.DepartmentID;

            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                var token = await _userManager.GeneratePasswordResetTokenAsync(user);
                await _userManager.ResetPasswordAsync(user, token, dto.Password);
            }

            var updateResult = await _userManager.UpdateAsync(user);
            if (!updateResult.Succeeded)
                throw new Exception(string.Join(", ", updateResult.Errors.Select(e => e.Description)));

            return MapToDto(user);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null)
                return false;

            var isStudent = await _userManager.IsInRoleAsync(user, nameof(UserRoleType.Student));
            if (!isStudent)
                return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        public async Task<IEnumerable<StudentCreateDto>> GetStudentsByInstructorAsync(int instructorId)
        {
            // Get the instructor and their courses
            var instructor = await _context.Instructors
     .Include(i => i.CourseInstructors)       // include join table
         .ThenInclude(ci => ci.Course)        // include courses
     .FirstOrDefaultAsync(i => i.InstructorID == instructorId);

            if (instructor == null)
                return new List<StudentCreateDto>();

            var courseIds = instructor.CourseInstructors
                .Select(ci => ci.CourseID)
                .ToList();
            // Get all student IDs enrolled in those courses
            var studentIds = await _context.Enrollments
                .Where(e => courseIds.Contains(e.CourseID))
                .Select(e => e.StudentID)
                .Distinct()
                .ToListAsync();

            // Get the student users
            var students = new List<StudentCreateDto>();
            foreach (var studentId in studentIds)
            {
                var student = await GetByIdAsync(studentId);
                if (student != null)
                {
                    students.Add(student);
                }
            }

            return students;
        }

        public async Task<IEnumerable<StudentCreateDto>> GetStudentsByCourseAsync(int courseId)
        {
            // Get all student IDs enrolled in the course
            var studentIds = await _context.Enrollments
                .Where(e => e.CourseID == courseId)
                .Select(e => e.StudentID)
                .Distinct()
                .ToListAsync();

            // Get the student users
            var students = new List<StudentCreateDto>();
            foreach (var studentId in studentIds)
            {
                var student = await GetByIdAsync(studentId);
                if (student != null)
                {
                    students.Add(student);
                }
            }

            return students;
        }

        private StudentCreateDto MapToDto(ApplicationUser u)
        {
            var dto = new StudentCreateDto
            {
                Id = u.Id,
                FirstMidName = u.FirstMidName,
                LastName = u.LastName,
                Email = u.Email ?? "",
                PhoneNumber = u.PhoneNumber,
                EnrollmentDate = u.EnrollmentDate,
                DepartmentID = u.DepartmentID
            };

            // Load department name if DepartmentID is set
            if (u.DepartmentID.HasValue)
            {
                var dept = _context.Departments
                    .AsNoTracking()
                    .FirstOrDefault(d => d.DepartmentID == u.DepartmentID);
                dto.DepartmentName = dept?.Name;
            }

            return dto;
        }
    }
}
