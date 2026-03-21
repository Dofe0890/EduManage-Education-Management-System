using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NuGet.DependencyResolver;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Interfaces;
using StudentBusinessLayer.Services;
using StudentBusinessLayer.FilterDTOs;
using StudentDataAccessLayer.Models;

namespace StudentManagementAPI.Controllers
{
    [Authorize]
    [Route("api/attendance")]
    [ApiController]
    public class AttendanceController : ControllerBase
    {
        private readonly IAttendancesService _attendancesService;
        private readonly IMapper _mapper;

        public AttendanceController(IAttendancesService attendancesService  , IMapper mapper)
        {
            _mapper = mapper;
            _attendancesService = attendancesService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> GetAllAttendance([FromQuery] AttendanceFilterDTO filter)
        {


            var attendancesList = await _attendancesService.GetAttendances(filter);
            if (attendancesList == null)
            {
                return NotFound("No Attendance Found!");
            }

            var dto = _mapper.Map<IEnumerable<AttendanceDTO>>(attendancesList);

            return Ok(dto);
        }



        [HttpGet("{ID}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<AttendanceDTO>> GetAttendanceById(int ID)
        {
            if (ID < 0)
                return BadRequest("Bad request");

            var attendance = await _attendancesService.GetAttendanceById(ID);

            if (attendance == null)
                return NotFound($"No Attendance with {ID} are Found!");

            var dto = _mapper.Map<AttendanceDTO>(attendance);

            return Ok(dto);

        }




        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]

        public async Task<ActionResult<AttendanceDTO>> AddAttendance([FromBody] AttendanceDTO attendanceDTO)
        {
            if (attendanceDTO == null || attendanceDTO.studentId <= 0 || attendanceDTO.classroomId <= 0)
                return BadRequest("Bad request");


            var attendanceEntity = _mapper.Map<Attendance>(attendanceDTO);

            var result = await _attendancesService.AddNewAttendancePerStudent(attendanceEntity);

           

            if (result == null)
                return BadRequest("Invalid operation"); 
            
            var dto = _mapper.Map<AttendanceDTO>(result);

            return Ok(dto);


        }
 



        [HttpDelete("{ID}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteAttendance(int ID)
        {
            if (ID < 1)
            {
                return BadRequest($"Not accepted ID {ID}");
            }

            await _attendancesService.DeleteAttendance(ID);
            return NoContent();
        }




        [HttpGet("StudentCount", Name = "getStudentCountAttendance")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<int>> GetStudentCount(int studentId)
        {
            if (studentId < 0)
            {
                return BadRequest("Bad request");
            }


            var studentCount = await _attendancesService.CountAttendancePerStudent( studentId);
            if (studentCount < 0)
            {
                return NotFound($"No Attendance With StudentID {studentId}  are  Found!");
            }



            return Ok(studentCount);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<AttendanceDTO>> UpdateAttendance(int id, [FromBody] AttendanceDTO attendanceDTO)
        {
            if (id <= 0)
                return BadRequest("Invalid attendance ID");

            if (attendanceDTO == null)
                return BadRequest("Attendance data is required");

            var attendanceEntity = _mapper.Map<Attendance>(attendanceDTO);
            var result = await _attendancesService.UpdateAttendance(id, attendanceEntity);

            if (result == null)
                return NotFound($"Attendance with ID {id} not found");

            var dto = _mapper.Map<AttendanceDTO>(result);
            return Ok(dto);
        }

        [HttpPost("bulk")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<IEnumerable<AttendanceDTO>>> BulkUpdateAttendance([FromBody] IEnumerable<AttendanceDTO> attendanceDTOs)
        {
            if (attendanceDTOs == null || !attendanceDTOs.Any())
                return BadRequest("Attendance records are required");

            var attendanceEntities = _mapper.Map<IEnumerable<Attendance>>(attendanceDTOs);
            var results = await _attendancesService.BulkUpdateAttendance(attendanceEntities);
            var dtos = _mapper.Map<IEnumerable<AttendanceDTO>>(results);

            return Ok(dtos);
        }

    }
}
