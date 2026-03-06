using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ELearningModels.DTO;
using ELearningModels.Iservice;
using ELearningModels.model;

namespace ELearningModels.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class InstructorController : ControllerBase
    {
        private readonly IInstructorService _service;

        public InstructorController(IInstructorService service)
        {
            _service = service;
        }

        // ------------------- CRUD -------------------

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var instructors = await _service.GetAllAsync();
            return Ok(instructors);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var instructor = await _service.GetByIdAsync(id);
            if (instructor == null) return NotFound(new { message = "Instructor not found" });
            return Ok(instructor);
        }

        [HttpPost]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Create([FromBody] InstructorCreateDto dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.InstructorID }, result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Instructor,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] InstructorCreateDto dto)
        {
            if (id != dto.InstructorID)
                return BadRequest(new { message = "ID in URL and body must match" });

            var result = await _service.UpdateAsync(dto);
            if (result == null) return NotFound(new { message = "Instructor not found" });

            return Ok(result);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _service.DeleteAsync(id);
            if (!result) return NotFound(new { message = "Instructor not found" });

            return Ok(new { message = "Instructor deleted successfully" });
        }

        // ------------------- Course Management -------------------

        [HttpGet("{id}/courses")]
        public async Task<IActionResult> GetInstructorCourses(int id)
        {
            var courses = await _service.GetInstructorCoursesAsync(id);
            if (!courses.Any()) return NotFound(new { message = "No courses found" });

            return Ok(courses);
        }

        [HttpGet("{id}/available-courses")]
        public async Task<IActionResult> GetAvailableCourses(int id)
        {
            var courses = await _service.GetAvailableCoursesAsync(id);
            return Ok(courses);
        }

        [HttpPost("{id}/assign-course/{courseId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignCourse(int id, int courseId)
        {
            await _service.AssignCourseAsync(id, courseId);
            return Ok(new { message = "Course assigned successfully" });
        }

        [HttpDelete("{id}/remove-course/{courseId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveCourse(int id, int courseId)
        {
            await _service.RemoveEnrollmentAsync(id, courseId);
            return Ok(new { message = "Course removed successfully" });
        }

        // ------------------- Student Assignment -------------------

        [HttpPost("{id}/assign-student/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AssignStudentToInstructor(int id, int studentId)
        {
            try
            {
                await _service.AssignInstructorToStudentAsync(id, studentId);
                return Ok(new { message = "Instructor assigned to student successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpDelete("{id}/remove-student/{studentId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RemoveStudentFromInstructor(int id, int studentId)
        {
            try
            {
                await _service.RemoveInstructorFromStudentAsync(id, studentId);
                return Ok(new { message = "Instructor removed from student successfully" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}/advised-students")]
        [Authorize(Roles = "Admin,Instructor")]
        public async Task<IActionResult> GetAdvisedStudents(int id)
        {
            try
            {
                var students = await _service.GetAdvisedStudentsAsync(id);
                if (!students.Any()) return Ok(new List<ApplicationUser>());

                return Ok(students);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}