using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ELearningModels.DTO;
using ELearningModels.Iservice;

namespace ELearningModels.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin,Student")]
    public class StudentController : ControllerBase
    {
        private readonly IStudentService _service;

        public StudentController(IStudentService service)
        {
            _service = service;
        }

        // GET: api/student
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var students = await _service.GetAllAsync();
            return Ok(students);
        }

        // GET: api/student/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var student = await _service.GetByIdAsync(id);
            if (student == null)
                return NotFound(new { message = "Student not found" });
            return Ok(student);
        }

        // POST: api/student (register new student) - Instructor/Admin only
        [HttpPost]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Create([FromBody] StudentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            if (string.IsNullOrWhiteSpace(dto.Password))
                return BadRequest(new { message = "Password is required for new student." });

            try
            {
                var result = await _service.CreateAsync(dto);
                if (result == null)
                    return BadRequest(new { message = "Failed to create student" });

                return CreatedAtAction(nameof(GetById), new { id = result.Id }, new StudentCreateDto
                {
                    Id = result.Id,
                    FirstMidName = result.FirstMidName,
                    LastName = result.LastName,
                    Email = result.Email ?? string.Empty,
                    PhoneNumber = result.PhoneNumber,
                    EnrollmentDate = result.EnrollmentDate
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // PUT: api/student/5 - Instructor/Admin only
        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] StudentCreateDto dto)
        {
            if (id != dto.Id)
                return BadRequest(new { message = "ID in URL and body must match" });

            var result = await _service.UpdateAsync(dto);
            if (result == null)
                return NotFound(new { message = "Student not found" });

            return Ok(result);
        }

        // DELETE: api/student/5 - Instructor/Admin only
        [HttpDelete("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result)
                return NotFound(new { message = "Student not found" });
            return Ok(new { message = "Student deleted successfully" });
        }

        // GET: api/student/search/instructor/5
        [HttpGet("search/instructor/{instructorId}")]
        public async Task<IActionResult> GetStudentsByInstructor(int instructorId)
        {
            var students = await _service.GetStudentsByInstructorAsync(instructorId);
            return Ok(students);
        }

        // GET: api/student/search/course/5
        [HttpGet("search/course/{courseId}")]
        public async Task<IActionResult> GetStudentsByCourse(int courseId)
        {
            var students = await _service.GetStudentsByCourseAsync(courseId);
            return Ok(students);
        }

        // GET: api/student/search?userid=1&instructorId=2&courseId=3
        [HttpGet("search")]
        public async Task<IActionResult> SearchStudents([FromQuery] int? userid, [FromQuery] int? instructorId, [FromQuery] int? courseId)
        {
            if (userid.HasValue)
            {
                var student = await _service.GetByIdAsync(userid.Value);
                return student != null ? Ok(new[] { student }) : Ok(new StudentCreateDto[0]);
            }

            if (instructorId.HasValue)
            {
                var students = await _service.GetStudentsByInstructorAsync(instructorId.Value);
                return Ok(students);
            }

            if (courseId.HasValue)
            {
                var students = await _service.GetStudentsByCourseAsync(courseId.Value);
                return Ok(students);
            }

            // If no parameters provided, return all students
            var allStudents = await _service.GetAllAsync();
            return Ok(allStudents);
        }
    }
}
