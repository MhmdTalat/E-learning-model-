using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ELearningModels.Data;
using ELearningModels.DTO;
using ELearningModels.Iservice;
using ELearningModels.model;

namespace ELearningModels.service
{
    /// <summary>
    /// Service class responsible for managing student course enrollments.
    /// Provides functionality for creating, reading, updating, and deleting enrollments
    /// with proper validation and business rule enforcement.
    /// </summary>
    public class EnrollmentService : IEnrollmentService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        /// <summary>
        /// Initializes a new instance of the <see cref="EnrollmentService"/> class.
        /// </summary>
        /// <param name="context">The application database context.</param>
        /// <param name="userManager">The user manager for handling user operations.</param>
        public EnrollmentService(AppDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _userManager = userManager ?? throw new ArgumentNullException(nameof(userManager));
        }

        #region Retrieval Methods

        /// <summary>
        /// Retrieves all enrollments in the system with related course and department information.
        /// </summary>
        /// <returns>A collection of all enrollment detail DTOs.</returns>
        public async Task<IEnumerable<EnrollmentDetailDto>> GetAllAsync()
        {
            return await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Department)
                .Include(e => e.Student)
                .Select(enrollment => new EnrollmentDetailDto
                {
                    EnrollmentID = enrollment.EnrollmentID,
                    CourseID = enrollment.CourseID,
                    StudentID = enrollment.StudentID,
                    Grade = enrollment.Grade,
                    EnrollmentDate = enrollment.EnrollmentDate,
                    CourseName = enrollment.Course.Title,
                    Credits = enrollment.Course.Credits,
                    DepartmentID = enrollment.Course.DepartmentID,
                    DepartmentName = enrollment.Course.Department.Name,
                    StudentName = enrollment.Student.FirstMidName + " " + enrollment.Student.LastName,
                    StudentEmail = enrollment.Student.Email
                })
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves a specific enrollment by its ID with related course and department information.
        /// </summary>
        /// <param name="id">The enrollment ID to retrieve.</param>
        /// <returns>The enrollment detail DTO if found; otherwise, null.</returns>
        public async Task<EnrollmentDetailDto?> GetByIdAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Enrollment ID must be greater than zero.", nameof(id));

            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .ThenInclude(c => c.Department)
                .Include(e => e.Student)
                .FirstOrDefaultAsync(e => e.EnrollmentID == id);

            if (enrollment == null)
                return null;

            return new EnrollmentDetailDto
            {
                EnrollmentID = enrollment.EnrollmentID,
                CourseID = enrollment.CourseID,
                StudentID = enrollment.StudentID,
                Grade = enrollment.Grade,
                EnrollmentDate = enrollment.EnrollmentDate,
                CourseName = enrollment.Course.Title,
                Credits = enrollment.Course.Credits,
                DepartmentID = enrollment.Course.DepartmentID,
                DepartmentName = enrollment.Course.Department.Name,
                StudentName = enrollment.Student.FirstMidName + " " + enrollment.Student.LastName,
                StudentEmail = enrollment.Student.Email
            };
        }

        /// <summary>
        /// Retrieves all enrollments for a specific student with course and department details.
        /// </summary>
        /// <param name="studentId">The student ID to retrieve enrollments for.</param>
        /// <returns>A collection of enrollment detail DTOs for the specified student.</returns>
        public async Task<IEnumerable<EnrollmentDetailDto>> GetEnrollmentsByStudentAsync(int studentId)
        {
            if (studentId <= 0)
                throw new ArgumentException("Student ID must be greater than zero.", nameof(studentId));

            return await _context.Enrollments
                .Where(enrollment => enrollment.StudentID == studentId)
                .Include(e => e.Course)
                .ThenInclude(c => c.Department)
                .Include(e => e.Student)
                .Select(enrollment => new EnrollmentDetailDto
                {
                    EnrollmentID = enrollment.EnrollmentID,
                    CourseID = enrollment.CourseID,
                    StudentID = enrollment.StudentID,
                    Grade = enrollment.Grade,
                    EnrollmentDate = enrollment.EnrollmentDate,
                    CourseName = enrollment.Course.Title,
                    Credits = enrollment.Course.Credits,
                    DepartmentID = enrollment.Course.DepartmentID,
                    DepartmentName = enrollment.Course.Department.Name,
                    StudentName = enrollment.Student.FirstMidName + " " + enrollment.Student.LastName,
                    StudentEmail = enrollment.Student.Email
                })
                .ToListAsync();
        }

        /// <summary>
        /// Retrieves all enrollments for a specific course with student and department details.
        /// </summary>
        /// <param name="courseId">The course ID to retrieve enrollments for.</param>
        /// <returns>A collection of enrollment detail DTOs for the specified course.</returns>
        public async Task<IEnumerable<EnrollmentDetailDto>> GetEnrollmentsByCourseAsync(int courseId)
        {
            if (courseId <= 0)
                throw new ArgumentException("Course ID must be greater than zero.", nameof(courseId));

            return await _context.Enrollments
                .Where(enrollment => enrollment.CourseID == courseId)
                .Include(e => e.Course)
                .ThenInclude(c => c.Department)
                .Include(e => e.Student)
                .Select(enrollment => new EnrollmentDetailDto
                {
                    EnrollmentID = enrollment.EnrollmentID,
                    CourseID = enrollment.CourseID,
                    StudentID = enrollment.StudentID,
                    Grade = enrollment.Grade,
                    EnrollmentDate = enrollment.EnrollmentDate,
                    CourseName = enrollment.Course.Title,
                    Credits = enrollment.Course.Credits,
                    DepartmentID = enrollment.Course.DepartmentID,
                    DepartmentName = enrollment.Course.Department.Name,
                    StudentName = enrollment.Student.FirstMidName + " " + enrollment.Student.LastName,
                    StudentEmail = enrollment.Student.Email
                })
                .ToListAsync();
        }

        #endregion

        #region Modification Methods

        /// <summary>
        /// Creates a new enrollment for a student in a course.
        /// Performs validation to ensure the course exists, student exists and has proper role,
        /// and prevents duplicate enrollments.
        /// </summary>
        /// <param name="dto">The enrollment creation data.</param>
        /// <returns>The created enrollment entity.</returns>
        /// <exception cref="ArgumentNullException">Thrown when dto is null.</exception>
        /// <exception cref="ArgumentException">Thrown when validation fails.</exception>
        /// <exception cref="InvalidOperationException">Thrown when business rules are violated.</exception>
        public async Task<Enrollment> CreateAsync(EnrollmentCreateDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            // Validate input parameters
            if (dto.CourseID <= 0)
                throw new ArgumentException("Course ID must be greater than zero.", nameof(dto.CourseID));
            if (dto.StudentID <= 0)
                throw new ArgumentException("Student ID must be greater than zero.", nameof(dto.StudentID));

            // Validate that the course exists
            var courseExists = await _context.Courses.AnyAsync(course => course.CourseID == dto.CourseID);
            if (!courseExists)
                throw new InvalidOperationException("The specified course does not exist in the system.");

            // Validate that the student exists and has the proper role
            var student = await _userManager.FindByIdAsync(dto.StudentID.ToString());
            if (student == null)
                throw new InvalidOperationException("The specified student does not exist in the system.");

            var isStudent = await _userManager.IsInRoleAsync(student, "Student");
            if (!isStudent)
                throw new InvalidOperationException("The specified user is not registered as a student.");

            // Check if student is already enrolled in this course
            var existingEnrollment = await _context.Enrollments
                .AnyAsync(enrollment => enrollment.CourseID == dto.CourseID && enrollment.StudentID == dto.StudentID);
            if (existingEnrollment)
                throw new InvalidOperationException("The student is already enrolled in this course.");

            // Create the enrollment
            var enrollment = new Enrollment
            {
                CourseID = dto.CourseID,
                StudentID = dto.StudentID,
                Grade = dto.Grade
            };

            _context.Enrollments.Add(enrollment);
            await _context.SaveChangesAsync();

            return enrollment;
        }

        /// <summary>
        /// Updates an existing enrollment with new information.
        /// </summary>
        /// <param name="dto">The enrollment update data containing the enrollment ID and new values.</param>
        /// <returns>The updated enrollment DTO if successful; otherwise, null.</returns>
        /// <exception cref="ArgumentNullException">Thrown when dto is null.</exception>
        /// <exception cref="ArgumentException">Thrown when validation fails.</exception>
        public async Task<EnrollmentCreateDto?> UpdateAsync(EnrollmentCreateDto dto)
        {
            if (dto == null)
                throw new ArgumentNullException(nameof(dto));

            if (dto.EnrollmentID <= 0)
                throw new ArgumentException("Enrollment ID must be greater than zero.", nameof(dto.EnrollmentID));
            if (dto.CourseID <= 0)
                throw new ArgumentException("Course ID must be greater than zero.", nameof(dto.CourseID));
            if (dto.StudentID <= 0)
                throw new ArgumentException("Student ID must be greater than zero.", nameof(dto.StudentID));

            var enrollment = await _context.Enrollments.FindAsync(dto.EnrollmentID);
            if (enrollment == null)
                return null;

            // Update enrollment properties
            enrollment.CourseID = dto.CourseID;
            enrollment.StudentID = dto.StudentID;
            enrollment.Grade = dto.Grade;

            await _context.SaveChangesAsync();

            return new EnrollmentCreateDto
            {
                EnrollmentID = enrollment.EnrollmentID,
                CourseID = enrollment.CourseID,
                StudentID = enrollment.StudentID,
                Grade = enrollment.Grade
            };
        }

        /// <summary>
        /// Deletes an enrollment by its ID.
        /// </summary>
        /// <param name="id">The enrollment ID to delete.</param>
        /// <returns>True if the enrollment was deleted; otherwise, false.</returns>
        /// <exception cref="ArgumentException">Thrown when id is invalid.</exception>
        public async Task<bool> DeleteAsync(int id)
        {
            if (id <= 0)
                throw new ArgumentException("Enrollment ID must be greater than zero.", nameof(id));

            var enrollment = await _context.Enrollments.FindAsync(id);
            if (enrollment == null)
                return false;

            _context.Enrollments.Remove(enrollment);
            await _context.SaveChangesAsync();

            return true;
        }

        #endregion
    }
}