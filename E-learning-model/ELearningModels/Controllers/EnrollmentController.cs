using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ELearningModels.DTO;
using ELearningModels.Iservice;

namespace ELearningModels.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin,Student")]
    public class EnrollmentController : ControllerBase
    {
        private readonly IEnrollmentService _service;

        public EnrollmentController(IEnrollmentService service)
        {
            _service = service;
        }

        // GET: api/enrollment
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var enrollments = await _service.GetAllAsync();
            return Ok(enrollments);
        }

        // GET: api/enrollment/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var enrollment = await _service.GetByIdAsync(id);
            if (enrollment == null)
                return NotFound(new { message = "Enrollment not found" });
            return Ok(enrollment);
        }

        // GET: api/enrollment/student/5
        [HttpGet("student/{studentId}")]
        public async Task<IActionResult> GetByStudent(int studentId)
        {
            var enrollments = await _service.GetEnrollmentsByStudentAsync(studentId);
            return Ok(enrollments);
        }

        // GET: api/enrollment/course/5
        [HttpGet("course/{courseId}")]
        public async Task<IActionResult> GetByCourse(int courseId)
        {
            var enrollments = await _service.GetEnrollmentsByCourseAsync(courseId);
            return Ok(enrollments);
        }

        // POST: api/enrollment - Instructor/Admin only
        [HttpPost]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Create([FromBody] EnrollmentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _service.CreateAsync(dto);
                return CreatedAtAction(nameof(GetById), new { id = result.EnrollmentID }, new EnrollmentCreateDto
                {
                    EnrollmentID = result.EnrollmentID,
                    CourseID = result.CourseID,
                    StudentID = result.StudentID,
                    Grade = result.Grade
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/enrollment/5 - Instructor/Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] EnrollmentCreateDto dto)
        {
            if (id != dto.EnrollmentID)
                return BadRequest(new { message = "ID in URL and body must match" });

            var result = await _service.UpdateAsync(dto);
            if (result == null)
                return NotFound(new { message = "Enrollment not found" });

            return Ok(result);
        }

        // DELETE: api/enrollment/5 - Instructor/Admin only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = "Enrollment not found" });
            return Ok(new { message = "Enrollment deleted successfully" });
        }
    }
}