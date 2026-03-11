using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.Model;
using StudentBusinessLayer.Services;

namespace StudentManagementAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] TokenRequestModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var result = await _authService.GetTokenAsync(model);

            if (!result.IsAuthenticated)
            {
                return Unauthorized(result.Meassage);
            }

            if (!string.IsNullOrEmpty(result.RefreshToken))
                SetRefreshTokenInCookie(result.RefreshToken, result.RefreshTokenExpiration);

            return Ok(result);
        }

        [HttpPost("refresh")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> RefreshToken()
        {
            var refreshToken = Request.Cookies["RefreshToken"];
            var result = await _authService.RefreshTokenAsync(refreshToken);
            if (!result.IsAuthenticated)
                return Unauthorized(result.Meassage);

            SetRefreshTokenInCookie(result.RefreshToken, result.RefreshTokenExpiration);

            return Ok(result);
        }

        [Authorize]
        [HttpPost("revoke")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> RevokeToken()
        {
            var token = Request.Cookies["refreshToken"];
            if (string.IsNullOrEmpty(token))
                return BadRequest("Token is required!");

Console.WriteLine(token);
            var result = await _authService.RevokeTokenAsync(token);
            if (!result)
                return BadRequest("Token is invalid!");

            return Ok(new { Message = "Token revoked successfully" });
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
