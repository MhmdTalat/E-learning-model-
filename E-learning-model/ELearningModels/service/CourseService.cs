using Microsoft.EntityFrameworkCore;
using ELearningModels.Data;
using ELearningModels.DTO;
using ELearningModels.Iservice;
using ELearningModels.model;

namespace ELearningModels.service
{
    public class CourseService : ICourseService
    {
        private readonly AppDbContext _context;

        public CourseService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Course>> GetAllAsync()
        {
            return await _context.Courses.ToListAsync();
        }

        public async Task<IEnumerable<Course>> GetByDepartmentAsync(int departmentId)
        {
            if (departmentId <= 0)
                throw new ArgumentException("Department ID must be greater than zero.", nameof(departmentId));

            return await _context.Courses
                .Where(c => c.DepartmentID == departmentId)
                .ToListAsync();
        }

        public async Task<Course> CreateAsync(CourseCreateDto dto)
        {
            var course = new Course
            {
                CourseID = dto.CourseID,
                Credits = dto.Credits,
                Title = dto.Title,
                DepartmentID = dto.DepartmentID
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();
            return course;
        }
        public async Task<Course?> UpdateAsync(CourseCreateDto dto)
        {
            var cou = await _context.Courses.FindAsync(dto.CourseID);
            if (cou == null) return null;

            cou.CourseID = dto.CourseID;
            cou.Credits = dto.Credits;
            cou.Title = dto.Title;
            cou.DepartmentID = dto.DepartmentID;

            await _context.SaveChangesAsync();
            return cou;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var cou = await _context.Courses.FindAsync(id);
            if (cou == null) return false;

            _context.Courses.Remove(cou);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
