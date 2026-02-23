using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using ELearningModels.Data;
using Microsoft.EntityFrameworkCore;
using ELearningModels.model;
using ELearningModels.DTO;
using Microsoft.AspNetCore.Identity;
using ELearningModels.Iservice;

namespace ELearningModels.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Instructor,Admin")]
    public class AnalysisController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEnrollmentService _enrollmentService;

        public AnalysisController(AppDbContext context, UserManager<ApplicationUser> userManager, IEnrollmentService enrollmentService)
        {
            _context = context;
            _userManager = userManager;
            _enrollmentService = enrollmentService;
        }
        // GET: api/analysis
        [HttpGet]
        public async Task<IActionResult> GetMetrics()
        {
            var process = Process.GetCurrentProcess();

            // basic memory and process metrics
            var workingSet = process.WorkingSet64; // bytes
            var privateBytes = process.PrivateMemorySize64;
            var virtualBytes = process.VirtualMemorySize64;
            var threads = process.Threads.Count;
            var startTime = process.StartTime;
            var uptime = DateTime.UtcNow - startTime.ToUniversalTime();

            // GC info
            var managedHeap = GC.GetTotalMemory(false);
            var gen0 = GC.CollectionCount(0);
            var gen1 = GC.CollectionCount(1);
            var gen2 = GC.CollectionCount(2);

            // short CPU sampling to estimate % CPU used by process
            var cpuPercent = await EstimateCpuUsagePercentAsync(process, 500);

            // Course analysis: users and instructors per course
            var courses = await _context.Courses
                .Include(c => c.Enrollments) // still fine
                .Include(c => c.CourseInstructors) // include join table
                    .ThenInclude(ci => ci.Instructor) // include Instructor through join
                .ToListAsync();
            var coursesData = courses.Select(c => new
            {
                CourseID = c.CourseID,
                Title = c.Title,
                StudentCount = c.Enrollments.Count,
                InstructorCount = c.CourseInstructors.Count,
                Instructors = c.CourseInstructors
                    .Select(ci => ci.Instructor.FirstMidName + " " + ci.Instructor.LastName)
                    .ToList()
            }).ToList();
            // User role counts
            var roles = await _context.Roles.ToListAsync();
            var studentRole = roles.FirstOrDefault(r => r.Name == "Student");
            var instructorRole = roles.FirstOrDefault(r => r.Name == "Instructor");
            var adminRole = roles.FirstOrDefault(r => r.Name == "Admin");
            var userCounts = new
            {
                Students = studentRole != null ? await _context.UserRoles.CountAsync(ur => ur.RoleId == studentRole.Id) : 0,
                Instructors = instructorRole != null ? await _context.UserRoles.CountAsync(ur => ur.RoleId == instructorRole.Id) : 0,
                Admins = adminRole != null ? await _context.UserRoles.CountAsync(ur => ur.RoleId == adminRole.Id) : 0
            };

            var payload = new
            {
                Uptime = uptime.ToString("c"),
                StartedAt = startTime,
                ProcessId = process.Id,
                ProcessorCount = Environment.ProcessorCount,
                WorkingSetBytes = workingSet,
                PrivateBytes = privateBytes,
                VirtualBytes = virtualBytes,
                Threads = threads,
                ManagedHeapBytes = managedHeap,
                GC = new { Gen0 = gen0, Gen1 = gen1, Gen2 = gen2 },
                CpuPercent = Math.Round(cpuPercent, 2),
                Timestamp = DateTime.UtcNow,
                Courses = coursesData,
                UserCounts = userCounts
            };

            return Ok(payload);
        }

        // POST: api/analysis/enroll
        [HttpPost("enroll")]
        public async Task<IActionResult> EnrollStudent([FromBody] EnrollmentCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var result = await _enrollmentService.CreateAsync(dto);
                return Ok(new
                {
                    result.EnrollmentID,
                    result.CourseID,
                    result.StudentID,
                    result.Grade,
                    message = "Student enrolled successfully"
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private static async Task<double> EstimateCpuUsagePercentAsync(Process process, int sampleMs)
        {
            try
            {
                var startTime = DateTime.UtcNow;
                var startCpu = process.TotalProcessorTime;
                await Task.Delay(sampleMs);
                process.Refresh();
                var endTime = DateTime.UtcNow;
                var endCpu = process.TotalProcessorTime;

                var cpuUsedMs = (endCpu - startCpu).TotalMilliseconds;
                var realMs = (endTime - startTime).TotalMilliseconds;
                if (realMs <= 0) return 0.0;

                // normalize by number of logical processors
                var cpuPercent = (cpuUsedMs / (realMs * Environment.ProcessorCount)) * 100.0;
                return Math.Max(0.0, Math.Min(100.0, cpuPercent));
            }
            catch
            {
                return 0.0;
            }
        }
    }
}
