using AutoMapper;
using ELearningModels.model;
using ELearningModels.DTO;

public class InstructorProfile : Profile
{
    public InstructorProfile()
    {
        CreateMap<Instructor, InstructorCreateDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null));

        CreateMap<InstructorCreateDto, Instructor>()
            .ForMember(dest => dest.Department, opt => opt.Ignore());
    }
}
