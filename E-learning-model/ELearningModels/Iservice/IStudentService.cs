using ELearningModels.DTO;
using ELearningModels.model;

namespace ELearningModels.Iservice
{
    public interface IStudentService
    {
        Task<IEnumerable<StudentCreateDto>> GetAllAsync();
        Task<StudentCreateDto?> GetByIdAsync(int id);
        Task<ApplicationUser> CreateAsync(StudentCreateDto dto);
        Task<StudentCreateDto?> UpdateAsync(StudentCreateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<StudentCreateDto>> GetStudentsByInstructorAsync(int instructorId);
        Task<IEnumerable<StudentCreateDto>> GetStudentsByCourseAsync(int courseId);
    }
}
