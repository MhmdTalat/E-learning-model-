using ELearningModels.Data;  // <-- this is where AppDbContext lives
using ELearningModels.DTO;
using ELearningModels.Iservice;
using ELearningModels.model;
using Microsoft.EntityFrameworkCore;

namespace ELearningModels.service
{
    public class InstructorService : IInstructorService
    {
        private readonly AppDbContext _context;

        public InstructorService(AppDbContext context)
        {
            _context = context;
        }

        // ------------------- CRUD -------------------
        public async Task<IEnumerable<Instructor>> GetAllAsync()
        {
            return await _context.Instructors.ToListAsync();
        }

        public async Task<InstructorCreateDto?> GetByIdAsync(int id)
        {
            var instructor = await _context.Instructors.FindAsync(id);
            if (instructor == null) return null;

            return new InstructorCreateDto
            {
                InstructorID = instructor.InstructorID,
                FirstMidName = instructor.FirstMidName,
                LastName = instructor.LastName,
                HireDate = instructor.HireDate,
                Email = instructor.Email,
                PhoneNumber = instructor.PhoneNumber,
                DepartmentID = instructor.DepartmentID
            };
        }

        public async Task<Instructor> CreateAsync(InstructorCreateDto dto)
        {
            var instructor = new Instructor
            {
                FirstMidName = dto.FirstMidName,
                LastName = dto.LastName,
                HireDate = dto.HireDate,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                DepartmentID = dto.DepartmentID,
                Password = dto.Password
            };

            _context.Instructors.Add(instructor);
            await _context.SaveChangesAsync();
            return instructor;
        }

        public async Task<InstructorCreateDto?> UpdateAsync(InstructorCreateDto dto)
        {
            var instructor = await _context.Instructors.FindAsync(dto.InstructorID);
            if (instructor == null) return null;

            instructor.FirstMidName = dto.FirstMidName;
            instructor.LastName = dto.LastName;
            instructor.HireDate = dto.HireDate;
            instructor.Email = dto.Email;
            instructor.PhoneNumber = dto.PhoneNumber;
            instructor.DepartmentID = dto.DepartmentID;
            if (!string.IsNullOrEmpty(dto.Password))
                instructor.Password = dto.Password;

            await _context.SaveChangesAsync();
            return dto;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var instructor = await _context.Instructors.FindAsync(id);
            if (instructor == null) return false;

            _context.Instructors.Remove(instructor);
            await _context.SaveChangesAsync();
            return true;
        }

        // ------------------- Course Management -------------------

        public async Task<List<Course>> GetInstructorCoursesAsync(int instructorId)
        {
            var instructor = await _context.Instructors
                .Include(i => i.CourseInstructors)
                    .ThenInclude(ci => ci.Course)
                .FirstOrDefaultAsync(i => i.InstructorID == instructorId);

            return instructor?.CourseInstructors.Select(ci => ci.Course).ToList() ?? new List<Course>();
        }

        public async Task<List<Course>> GetAvailableCoursesAsync(int instructorId)
        {
            var assignedCourseIds = await _context.CourseInstructor
                .Where(ci => ci.InstructorID == instructorId)
                .Select(ci => ci.CourseID)
                .ToListAsync();

            return await _context.Courses
                .Where(c => !assignedCourseIds.Contains(c.CourseID))
                .ToListAsync();
        }

        public async Task AssignCourseAsync(int instructorId, int courseId)
        {
            var exists = await _context.CourseInstructor
                .AnyAsync(ci => ci.InstructorID == instructorId && ci.CourseID == courseId);

            if (!exists)
            {
                _context.CourseInstructor.Add(new CourseInstructor
                {
                    InstructorID = instructorId,
                    CourseID = courseId
                });
                await _context.SaveChangesAsync();
            }
        }

        public async Task RemoveEnrollmentAsync(int instructorId, int courseId)
        {
            var entity = await _context.CourseInstructor
                .FirstOrDefaultAsync(ci => ci.InstructorID == instructorId && ci.CourseID == courseId);

            if (entity != null)
            {
                _context.CourseInstructor.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}