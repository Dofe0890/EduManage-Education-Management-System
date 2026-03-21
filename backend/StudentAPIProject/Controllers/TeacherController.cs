using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.Interfaces;
using System.Security.Claims;
namespace StudentManagementAPI.Controllers
{
    [Authorize]
    [Route("api/teachers")]
    [ApiController]
    public class TeacherController : ControllerBase
    {
        private readonly ITeacherService _teacherService;
        private readonly IMapper _mapper;
        private readonly Microsoft.AspNetCore.Hosting.IWebHostEnvironment _env;

        public TeacherController(ITeacherService teacherService, IMapper mapper, Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
        {
            _mapper = mapper;
            _teacherService = teacherService;
            _env = env;
        }



[Authorize(Roles = "Admin")]
        [HttpGet("All",Name = "GetAllTeachers")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<TeacherDTO>>> GetAllTeachers([FromQuery] TeacherFilterDTO filter)
        {
            var result = await _teacherService.GetTeachers(filter);
            if (result == null)
                return NotFound("No teachers found.");

            var dto = _mapper.Map<IEnumerable<TeacherDTO>>(result);
            return Ok(dto);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TeacherWithDetailsDTO>> GetTeacherById(int id)
        {
            if (id <= 0)
                return BadRequest("ID must be greater than zero.");

            var result = await _teacherService.GetTeacherById(id);
            if (result == null)
                return NotFound("No teacher found.");

            var dto = _mapper.Map<TeacherWithDetailsDTO>(result);
            return Ok(dto);
        }

        [HttpGet("by-name")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TeacherWithDetailsDTO>> GetTeacherByName([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
                return BadRequest("Name cannot be null or empty.");

            var result = await _teacherService.GetTeacherByName(name);
            if (result == null)
                return NotFound("No teacher found.");

            var dto = _mapper.Map<TeacherWithDetailsDTO>(result);
            return Ok(dto);
        }

        [HttpGet("by-user-id")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<TeacherWithDetailsDTO>> GetTeacherByUserId()
        {
            // Input validation
            var currentUserId = User.FindFirst("uid")?.Value;
            if (string.IsNullOrWhiteSpace(currentUserId))
                return BadRequest("UserId cannot be null or empty.");

            // Get current user ID from JWT claims for authorization check
            if (string.IsNullOrEmpty(currentUserId))
                return Unauthorized("Invalid user token.");

            // Authorization: Users can only access their own data unless they're Admin
          
            try
            {
                var result = await _teacherService.GetTeacherByUserIdAsync(currentUserId);
                
                if (result == null)
                    return NotFound($"No teacher record found for user ID '{currentUserId}'.");

                // Map to DTO with all relationships populated
                var dto = _mapper.Map<TeacherWithDetailsDTO>(result);
                return Ok(dto);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException)
            {
                // Database integrity issue (e.g., duplicate records)
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "An error occurred while retrieving teacher data. Please contact support.");
            }
            catch (Exception)
            {
                // Log the exception in production
                return StatusCode(StatusCodes.Status500InternalServerError, 
                    "An unexpected error occurred while retrieving teacher data.");
            }
        }

        [HttpGet("me/dashboard/metrics")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<StudentBusinessLayer.DTOs.TeacherDashboardMetricsDto>> GetMyDashboardMetrics([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {

            Console.WriteLine("Auth: " + User.Identity.IsAuthenticated);
            Console.WriteLine("UserId: " + User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var currentUserId = User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(currentUserId))
                return Unauthorized("Invalid user.");

            var result = await _teacherService.GetTeacherDashboardMetricsByUserIdAsync(currentUserId, startDate, endDate);
            if (result == null)
                return NotFound("No dashboard metrics available.");

            return Ok(result);
        }

      

        [HttpPatch("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<string>> UpdateTeacher(int id, [FromBody] TeacherDTO dto)
        {
            if (dto == null || id <= 0)
                return BadRequest("Invalid teacher data.");

            // Get current user ID from claims
            var currentUserId = User.FindFirst("uid")?.Value;
            var isAdmin = User.IsInRole("Admin");
            
            // Get the teacher to check ownership
            var teacher = await _teacherService.GetTeacherById(id);
            if (teacher == null)
                return NotFound("Teacher not found.");
            
            // Check if user is trying to update their own profile or is Admin
            if (!isAdmin && currentUserId != teacher.UserId)
                return StatusCode(403, "You can only update your own teacher profile.");

            await _teacherService.EditTeacher(id, dto);
            return Ok("Teacher updated successfully.");
        }

        [HttpGet("{teacherId}/student-count")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult<TeacherStudentCountDto>> GetTeacherStudentCount(int teacherId)
        {
            if (teacherId <= 0)
                return BadRequest("Teacher ID must be greater than zero.");

            // Get current user ID from claims
            var currentUserId = User.FindFirst("uid")?.Value;
            var isAdmin = User.IsInRole("Admin");
            
            // Get teacher to check ownership
            var teacher = await _teacherService.GetTeacherById(teacherId);
            if (teacher == null)
                return NotFound("Teacher not found.");
            
            // Check if user is trying to access their own data or is Admin
            if (!isAdmin && currentUserId != teacher.UserId)
                return StatusCode(403, "You can only access your own teacher data.");

            var result = await _teacherService.GetTeacherStudentCountAsync(teacherId);
            return Ok(result);
        }
    }
}
