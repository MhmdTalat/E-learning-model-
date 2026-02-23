using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ELearningModels.DTO;
using ELearningModels.Iservice;

namespace ELearningModels.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin,Student")]
    public class DepartmentController : ControllerBase
    {
        private readonly IDepartmentService _service;

        public DepartmentController(IDepartmentService service)  // ✅ must match IDepartmentService
        {
            _service = service;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var departments = await _service.GetAllWithRelationsAsync();
            return Ok(departments);
        }

        [HttpPost]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Create([FromBody] DepartmentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var department = await _service.CreateAsync(dto);
                return Ok(department);
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
        public async Task<IActionResult> Update([FromBody] DepartmentCreateDto dto)
        {
            var dept = await _service.UpdateAsync(dto);
            if (dept == null)
                return NotFound(new { message = "Department not found" });
            return Ok(dept);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = "Department not found" });
            return Ok(new { message = "Department deleted" });
        }
    }
}

