using ELearningModels.DTO;
using ELearningModels.model;

namespace ELearningModels.Iservice
{
    public interface IEnrollmentService
    {
        Task<IEnumerable<EnrollmentDetailDto>> GetAllAsync();
        Task<EnrollmentDetailDto?> GetByIdAsync(int id);
        Task<Enrollment> CreateAsync(EnrollmentCreateDto dto);
        Task<EnrollmentCreateDto?> UpdateAsync(EnrollmentCreateDto dto);
        Task<bool> DeleteAsync(int id);
        Task<IEnumerable<EnrollmentDetailDto>> GetEnrollmentsByStudentAsync(int studentId);
        Task<IEnumerable<EnrollmentDetailDto>> GetEnrollmentsByCourseAsync(int courseId);
    }
}