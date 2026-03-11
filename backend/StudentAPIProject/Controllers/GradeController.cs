using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Interfaces;
using StudentBusinessLayer.Services;
using StudentDataAccessLayer.Models;

namespace StudentManagementAPI.Controllers
{
    [Authorize(Roles = "User")]
    [Route("api/grades")]
    [ApiController]
    public class GradeController : ControllerBase
    {
        private readonly IGradesService _gradesService;
        private readonly IMapper _mapper;
        public GradeController(IGradesService gradesService, IMapper mapper)
        {
            _gradesService = gradesService;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<GradeDTO>>> GetAllGrades([FromQuery]GradeFilterDTO filter)
        {
            var gradesList = await _gradesService.GetGradesAsync(filter);
            if (gradesList == null)
            {
                return NotFound("No Grades Found!");
            }

            var dto = _mapper.Map<IEnumerable<GradeDTO>>(gradesList);
            return Ok(dto);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GradeWithDetailsDTO>> GetGradeById(int id)
        {
            if (id < 0)
            {
                return BadRequest("Bad request");
            }

            var grade = await _gradesService.GetGradeByIdAsync(id);
            if (grade == null)
            {
                return NotFound($"No Grade with ID {id} Found!");
            }
            var dto = _mapper.Map<GradeWithDetailsDTO>(grade);
            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<GradeDTO>> CreateGrade([FromBody] GradeDTO newGrade)
        {
            if (newGrade == null || newGrade.teacherId < 0 || newGrade.studentId < 0 || newGrade.subjectId < 0 || newGrade.score < 0)
            {
                return BadRequest("Invalid grade data!");
            }
            var newGradeEntity = _mapper.Map<Grade>(newGrade);
            var result = await _gradesService.AddGradeAsync(newGradeEntity);

            if (result == null)
                return BadRequest("Failed to save");

            var resultDto = _mapper.Map<GradeDTO>(result);
            return CreatedAtAction(nameof(GetGradeById), new { id = resultDto.id }, resultDto);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EditGradeDTO>> UpdateGrade(int id, [FromBody] EditGradeDTO updateGradeDto)
        {
            if (id < 1 || updateGradeDto == null || updateGradeDto.teacherId < 0 ||
                updateGradeDto.studentId < 0 || updateGradeDto.subjectId < 0 || updateGradeDto.score < 0)
            {
                return BadRequest("Invalid grade data.");
            }

            await _gradesService.UpdateGradeAsync(id, updateGradeDto);
            return Ok(updateGradeDto);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteGrade(int id)
        {
            if (id < 1)
            {
                return BadRequest($"Not accepted ID {id}");
            }

            await _gradesService.DeleteGradeAsync(id);
            return NoContent();
        }

        
    }
}
