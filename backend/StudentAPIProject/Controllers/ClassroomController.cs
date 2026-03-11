using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;

namespace StudentManagementAPI.Controllers
{
    [Authorize(Roles = "User")]
    [Route("api/classrooms")]
    [ApiController]
    public class ClassroomController : ControllerBase
    {
        private readonly IClassroomService _classroomService;
        private readonly IMapper _mapper;

        public ClassroomController(IClassroomService classroomService, IMapper mapper)
        {
            _classroomService = classroomService;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PagedResponse<ClassroomDTO>>> GetAllClassrooms([FromQuery] ClassroomFilterDTO filter)
        {
            var (items, totalCount) = await _classroomService.GetAllClassesAsync(filter);
            if (items == null)
            {
                return NotFound("No Classrooms Found!");
            }
            var data = _mapper.Map<IEnumerable<ClassroomDTO>>(items);
            return Ok(new PagedResponse<ClassroomDTO> { Data = data, TotalCount = totalCount });
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClassroomDTOWithDetails>> GetClassroomById(int id)
        {
            if (id < 0)
            {
                return BadRequest("Bad request");
            }

            var classroom = await _classroomService.GetClassByIdWithDetails(id);
            if (classroom == null)
            {
                return NotFound($"No Classroom with ID {id} Found!");
            }
            var dto = _mapper.Map<ClassroomDTOWithDetails>(classroom);
            return Ok(dto);
        }

        [HttpGet("by-name")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClassroomDTOWithDetails>> GetClassroomByName([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
            {
                return BadRequest("Name cannot be null or empty.");
            }

            var classroom = await _classroomService.GetClassesByName(name);
            if (classroom == null)
            {
                return NotFound($"No Classroom with name {name} Found!");
            }

            var dto = _mapper.Map<ClassroomDTOWithDetails>(classroom);
            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ClassroomDTO>> CreateClassroom([FromBody] ClassroomDTO dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.name))
            {
                return BadRequest("Invalid classroom data!");
            }
            var classroom = _mapper.Map<Classroom>(dto);
            var result = await _classroomService.CreateClassroomAsync(classroom);

            if (result == null)
                return BadRequest("Failed to save");

            var resultDto = _mapper.Map<ClassroomDTO>(result);
            return CreatedAtAction(nameof(GetClassroomById), new { id = resultDto.id }, resultDto);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ClassroomDTO>> UpdateClassroom(int id, [FromBody] string updatedClassroomName)
        {
            if (id < 1 || updatedClassroomName == null || string.IsNullOrWhiteSpace(updatedClassroomName))
            {
                return BadRequest("Invalid classroom data.");
            }

            await _classroomService.EditClassroomAsync(id, updatedClassroomName);
            var updatedClassroom = await _classroomService.GetClassByIdWithDetails(id);
            var dto = _mapper.Map<ClassroomDTO>(updatedClassroom);
            return Ok(dto);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteClassroom(int id)
        {
            if (id < 1)
            {
                return BadRequest($"Not accepted ID {id}");
            }

            await _classroomService.DeleteClassroomAsync(id);
            return NoContent();
        }

        [HttpPost("{id}/assign-teacher")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> AssignTeacherToClassroom(int id, [FromBody] AssignTeacherRequest request)
        {
            if (id < 0 || request.TeacherId < 0)
            {
                return BadRequest("Invalid classroom or teacher data!");
            }

            await _classroomService.AssignTeacherAsync(id, request.TeacherId);

            return Ok(new { Message = "Teacher assigned successfully", ClassroomId = id, TeacherId = request.TeacherId });
        }
    }

    public class AssignTeacherRequest
    {
        public int TeacherId { get; set; }
    }
}
