using ELearningModels.DTO;
using ELearningModels.model;

namespace ELearningModels.Iservice
{
    public interface IInstructorService
    {
        // Basic CRUD
        Task<IEnumerable<Instructor>> GetAllAsync();
        Task<InstructorCreateDto?> GetByIdAsync(int id);
        Task<Instructor> CreateAsync(InstructorCreateDto dto);
        Task<InstructorCreateDto?> UpdateAsync(InstructorCreateDto dto);
        Task<bool> DeleteAsync(int id);

        // ===== Course management using CourseInstructor =====
        Task<List<Course>> GetInstructorCoursesAsync(int instructorId);
        Task<List<Course>> GetAvailableCoursesAsync(int instructorId);
        Task AssignCourseAsync(int instructorId, int courseId);
        Task RemoveEnrollmentAsync(int instructorId, int courseId);
    }
}