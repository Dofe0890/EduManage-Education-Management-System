using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Interfaces;
using StudentBusinessLayer.Model;
using StudentDataAccessLayer.Models;

namespace StudentManagementAPI.Controllers
{
    [Authorize(Roles = "Admin")]
    [Route("api/users")]
    [ApiController]
    public class UserManagementController : ControllerBase
    {
        private readonly IUserManagementService _userManagementService;
        public UserManagementController(IUserManagementService userManagementService)
        {
            _userManagementService = userManagementService;
        }

        [HttpPost("ReplaceAdmin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<RegisterAdminDTO>> ReplaceAdmin([FromBody] RegisterAdminDTO registerAdminRequest)
        {
            if (registerAdminRequest == null || string.IsNullOrEmpty(registerAdminRequest.Username) || string.IsNullOrEmpty(registerAdminRequest.FirstName) ||
                string.IsNullOrEmpty(registerAdminRequest.LastName) || string.IsNullOrEmpty(registerAdminRequest.Email) || string.IsNullOrEmpty(registerAdminRequest.Password))
            {
                return BadRequest("Invalid User data!");
            }
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var result = await _userManagementService.RegisterAdminAsync(registerAdminRequest);

            if (result == null)
                return BadRequest("Failed to save");

            return CreatedAtAction(nameof(ReplaceAdmin), new { id = result.UserId }, result);
        }

        [HttpPost("teachers")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<CreateTeacherDTO>> CreateTeacher([FromBody] RegisterTeacherDTO registerTeacherRequest)
        {
            if (registerTeacherRequest == null || string.IsNullOrEmpty(registerTeacherRequest.Username) || string.IsNullOrEmpty(registerTeacherRequest.TeacherName) || string.IsNullOrEmpty(registerTeacherRequest.FirstName) ||
                string.IsNullOrEmpty(registerTeacherRequest.LastName) || string.IsNullOrEmpty(registerTeacherRequest.Email) || string.IsNullOrEmpty(registerTeacherRequest.Password) || registerTeacherRequest.SubjectId < 0)
            {
                return BadRequest("Invalid Teacher data!");
            }

            var result = await _userManagementService.RegisterTeacherAsync(registerTeacherRequest);

            if (result == null)
                return BadRequest("Failed to save");

            SetRefreshTokenInCookie(result.Token, result.ExpirationOn);

            return CreatedAtAction(nameof(CreateTeacher), new{id = result.UserId} ,result);
        }

        [HttpDelete("teachers/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteTeacher(int id)
        {
            if (id < 1)
            {
                return BadRequest($"Not accepted ID {id}");
            }

            await _userManagementService.DeleteTeacherAsync(id);
            return NoContent();
        }

        [NonAction]
        public void SetRefreshTokenInCookie(string refreshToken, DateTime expires)
        {
            var cookieOption = new CookieOptions
            {
                HttpOnly = true,
                Secure = true, // Only send over HTTPS
                SameSite = SameSiteMode.Strict, // Prevent CSRF
                Expires = expires.ToLocalTime(),
                IsEssential = true
            };

            Response.Cookies.Append("RefreshToken", refreshToken, cookieOption);
        }
    }
}
