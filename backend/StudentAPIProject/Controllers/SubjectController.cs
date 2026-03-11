using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Interfaces;
using StudentBusinessLayer.FilterDTOs;

namespace StudentManagementAPI.Controllers
{
    [Authorize(Roles = "User")]
    [Route("api/subjects")]
    [ApiController]
    public class SubjectController : ControllerBase
    {
        private readonly ISubjectService _subjectService;
        private readonly IMapper _mapper;
        public SubjectController(ISubjectService subjectService, IMapper mapper)
        {
            _mapper = mapper;
            _subjectService = subjectService;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<SubjectDTO>>> GetAllSubjects([FromQuery]SubjectFilterDTO filter )
        {
            var result = await _subjectService.GetAllSubjectsAsync(filter);
            if (result == null)
                return NotFound("No subjects found.");

            var dto = _mapper.Map<IEnumerable<SubjectDTO>>(result);
            return Ok(dto);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SubjectDTO>> GetSubjectById(int id)
        {
            if (id <= 0)
                return BadRequest("ID must be greater than zero.");

            var result = await _subjectService.GetSubjectByIdAsync(id);
            if (result == null)
                return NotFound("No subject found.");

            var dto = _mapper.Map<SubjectDTO>(result);
            return Ok(dto);
        }

        [HttpGet("by-name")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<SubjectDTO>> GetSubjectByName([FromQuery] string name)
        {
            if (string.IsNullOrEmpty(name))
                return BadRequest("Name cannot be null or empty.");

            var result = await _subjectService.GetSubjectByNameAsync(name);
            if (result == null)
                return NotFound("No subject found.");

            var dto = _mapper.Map<SubjectDTO>(result);
            return Ok(dto);
        }
    }
}
