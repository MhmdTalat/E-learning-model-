using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ELearningModels.DTO;
using ELearningModels.Iservice;

namespace ELearningModels.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin,Student")] // كل الأدوار مسموح لهم الوصول

    public class CoursesController : ControllerBase
    {
        private readonly ICourseService _service;

        public CoursesController(ICourseService service)  // ✅ must match IDepartmentService
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var courses = await _service.GetAllAsync();
            return Ok(courses);
        }

        // GET: api/courses/department/5
        [HttpGet("department/{departmentId}")]
        public async Task<IActionResult> GetByDepartment(int departmentId)
        {
            try
            {
                var courses = await _service.GetByDepartmentAsync(departmentId);
                return Ok(courses);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Create([FromBody] CourseCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var courses = await _service.CreateAsync(dto);
                return Ok(courses);
            }
            catch (Exception ex)
            {
                return BadRequest(new
                {
                    message = ex.Message,
                    inner = ex.InnerException?.Message
                });
            }
        }
        [HttpPut]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Update([FromBody] CourseCreateDto dto)
        {
            var dept = await _service.UpdateAsync(dto);
            if (dept == null)
                return NotFound(new { message = "Course not found" });
            return Ok(dept);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = "Course not found" });
            return Ok(new { message = "Course deleted" });
        }
    }
}
