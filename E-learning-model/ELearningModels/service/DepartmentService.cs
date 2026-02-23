using ELearningModels.Iservice;
using ELearningModels.Data;
using ELearningModels.model;
using Microsoft.EntityFrameworkCore;
using ELearningModels.DTO;

namespace ELearningModels.service
{
    public class DepartmentService : IDepartmentService
    {
        private readonly AppDbContext _context;

        public DepartmentService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Department>> GetAllAsync()
        {
            return await _context.Departments.ToListAsync();
        }

        public async Task<IEnumerable<DepartmentListDto>> GetAllWithRelationsAsync()
        {
            return await _context.Departments
                .Include(d => d.Administrator)
                .Include(d => d.Courses)
                    .ThenInclude(c => c.Enrollments)
                .AsNoTracking()
                .Select(d => new DepartmentListDto
                {
                    DepartmentID = d.DepartmentID,
                    Name = d.Name,
                    Budget = d.Budget,
                    StartDate = d.StartDate,
                    InstructorID = d.InstructorID,
                    AdministratorName = d.Administrator != null
                        ? d.Administrator.FirstMidName + " " + d.Administrator.LastName
                        : null,
                    CourseCount = d.Courses.Count,
                    StudentCount = d.Courses.SelectMany(c => c.Enrollments).Select(e => e.StudentID).Distinct().Count()
                })
                .ToListAsync();
        }

        public async Task<Department> CreateAsync(DepartmentCreateDto dto)
        {
            // إذا تم تحديد InstructorID، تأكد من وجوده
            if (dto.InstructorID != null)
            {
                bool exists = await _context.Instructors.AnyAsync(i => i.InstructorID == dto.InstructorID);
                if (!exists)
                    throw new Exception("InstructorID does not exist.");
            }

            var department = new Department
            {
                Name = dto.Name,
                Budget = dto.Budget,
                StartDate = dto.StartDate,
                InstructorID = dto.InstructorID  // null مقبول
            };

            _context.Departments.Add(department);
            await _context.SaveChangesAsync();
            return department;
        }
        public async Task<Department?> UpdateAsync(DepartmentCreateDto dto)
        {
            var dept = await _context.Departments.FindAsync(dto.DepartmentID);
            if (dept == null) return null;

            dept.Name = dto.Name;
            dept.Budget = dto.Budget;
            dept.StartDate = dto.StartDate;
            dept.InstructorID = dto.InstructorID;

            await _context.SaveChangesAsync();
            return dept;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var dept = await _context.Departments.FindAsync(id);
            if (dept == null) return false;

            _context.Departments.Remove(dept);
            await _context.SaveChangesAsync();
            return true;
        }

    }
}
