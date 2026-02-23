using ELearningModels.DTO;
using ELearningModels.model;

namespace ELearningModels.Iservice
{
    public interface IDepartmentService
    {
        Task<IEnumerable<Department>> GetAllAsync();
        Task<IEnumerable<DepartmentListDto>> GetAllWithRelationsAsync();
        Task<Department> CreateAsync(DepartmentCreateDto dto);
        Task<Department?> UpdateAsync(DepartmentCreateDto dto);
        Task<bool> DeleteAsync(int id);
    }
}
