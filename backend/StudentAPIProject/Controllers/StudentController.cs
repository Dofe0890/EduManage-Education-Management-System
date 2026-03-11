using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.Services;
using StudentDataAccessLayer.Models;
using Models = StudentDataAccessLayer.Models;
using StudentBusinessLayer.Interfaces;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.FilterDTOs;
using StudentBusinessLayer.Model;
using AutoMapper;

namespace StudentManagementAPI.Controllers
{
    [Authorize(Roles = "User")]
    [Route("api/students")]
    [ApiController]
    public class StudentController : ControllerBase
    {

        private readonly IStudentService _studentService;
        private readonly IMapper _mapper;
        public StudentController(IStudentService studentService, IMapper mapper)
        {
            _studentService = studentService;
            _mapper = mapper;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PagedResponse<StudentDTO>>> GetAllStudents([FromQuery] StudentFilterDTO filter)
        {
            var (items, totalCount) = await _studentService.GetStudents(filter);
            if (items == null)
            {
                return NotFound("No Students Found!");
            }

            var data = _mapper.Map<IEnumerable<StudentDTO>>(items);
            return Ok(new PagedResponse<StudentDTO> { Data = data, TotalCount = totalCount });
        }

        [HttpGet("active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<StudentDTO>>> GetActiveStudents()
        {
            var studentsList = await _studentService.GetActiveStudents();
            if (studentsList == null || !studentsList.Any())
            {
                return NotFound("No Active Students Found!");
            }

            var dto = _mapper.Map<IEnumerable<StudentDTO>>(studentsList);
            return Ok(dto);
        }

        [HttpGet("status/{status}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<IEnumerable<StudentDTO>>> GetStudentsByStatus(StudentStatus status)
        {
            var studentsList = await _studentService.GetStudentsByStatus(status);
            if (studentsList == null || !studentsList.Any())
            {
                return NotFound($"No Students with status {status} Found!");
            }

            var dto = _mapper.Map<IEnumerable<StudentDTO>>(studentsList);
            return Ok(dto);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<StudentDTO>> GetStudentById(int id)
        {
            if (id <= 0)
            {
                return BadRequest("Bad request");
            }

            var student = await _studentService.GetStudentById(id);
            if (student == null)
            {
                return NotFound($"No Student with ID {id} Found!");
            }
            var dto = _mapper.Map<StudentDTO>(student);
            return Ok(dto);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<StudentDTO>> CreateStudent([FromBody] StudentCreateDTO newStudentDTO)
        {
            if (newStudentDTO == null || string.IsNullOrEmpty(newStudentDTO.name) || newStudentDTO.age < 0 || newStudentDTO.classroomId < 0)
            {
                return BadRequest("Invalid student data!");
            }

            var newStudent = _mapper.Map<Student>(newStudentDTO);
            var result = await _studentService.AddNewStudent(newStudent);

            if (result == null)
                return BadRequest("Failed to save");

            var resultDto = _mapper.Map<StudentDTO>(result);
            return CreatedAtAction(nameof(GetStudentById), new { id = resultDto.id }, resultDto);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<StudentDTO>> UpdateStudent(int id, [FromBody] StudentUpdateDTO updatedStudent)
        {
            if (id <= 0 || updatedStudent == null || string.IsNullOrWhiteSpace(updatedStudent.name)
                   || updatedStudent.age < 0 || updatedStudent.classroomId < 0)
            {
                return BadRequest("Invalid student data.");
            }

            var studentDto = _mapper.Map<StudentDTO>(updatedStudent);
            studentDto.id = id;
            
            await _studentService.EditStudent(id, studentDto);
            
            // Get the updated student to return with audit fields
            var updatedStudentEntity = await _studentService.GetStudentById(id);
            var resultDto = _mapper.Map<StudentDTO>(updatedStudentEntity);
            
            return Ok(resultDto);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteStudent(int id)
        {
            if (id <= 0)
            {
                return BadRequest($"Not accepted ID {id}");
            }

            await _studentService.DeleteStudent(id); // This now performs soft delete
            return NoContent();
        }

        [HttpPatch("{id}/soft-delete")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<StudentDTO>> SoftDeleteStudent(int id)
        {
            if (id <= 0)
            {
                return BadRequest($"Not accepted ID {id}");
            }

            var deletedStudent = await _studentService.SoftDeleteStudent(id);
            var dto = _mapper.Map<StudentDTO>(deletedStudent);
            
            return Ok(dto);
        }
    }
}
