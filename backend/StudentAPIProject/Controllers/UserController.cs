using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace StudentManagementAPI.Controllers
{
    /// <summary>
    /// User management controller
    /// Handles operations related to authenticated user information
    /// All endpoints require valid JWT authentication
    /// </summary>
    [Authorize]
    [Route("api/users")]
    [ApiController]
    [Produces("application/json")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UserController> _logger;

        public UserController(IUserService userService, ILogger<UserController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        /// <summary>
        /// Get the currently authenticated user's information
        /// 
        /// Endpoint: GET /api/users/me
        /// Authentication: Required (Bearer token)
        /// Authorization: None (any authenticated user can access)
        /// 
        /// This endpoint is designed for:
        /// - Frontend to initialize user session data
        /// - Validating token status
        /// - Refreshing user profile in UI
        /// - Checking user roles and permissions
        /// 
        /// Security Features:
        /// - Extracts user ID from JWT claims (not from request parameter)
        /// - Never accepts user ID as a route or query parameter
        /// - Returns DTO without sensitive fields (no password hashes, security stamps, tokens)
        /// - Validates user exists in database before returning data
        /// </summary>
        /// <returns>CurrentUserDTO containing the authenticated user's information</returns>
        /// <response code="200">Successfully retrieved current user information</response>
        /// <response code="401">User is not authenticated or token is invalid</response>
        /// <response code="500">User not found in database or server error</response>
        [HttpGet("me")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(CurrentUserDTO))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<CurrentUserDTO>> GetCurrentUser()
        {
            try
            {
                // Extract user from JWT claims
                var currentUser = await _userService.GetCurrentUserAsync(User);

                _logger.LogInformation($"Current user endpoint accessed by user: {currentUser.UserId}");

                return Ok(currentUser);
            }
            catch (InvalidOperationException ex)
            {
                _logger.LogWarning($"Invalid operation in GetCurrentUser: {ex.Message}");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new { message = "User information could not be retrieved", error = ex.Message }
                );
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error in GetCurrentUser: {ex.Message}");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new { message = "An unexpected error occurred", error = "Internal server error" }
                );
            }
        }

        /// <summary>
        /// Validate the current user's JWT token
        /// 
        /// Endpoint: GET /api/users/validate
        /// Authentication: Required (Bearer token)
        /// 
        /// This endpoint is useful for:
        /// - Checking token validity without full profile fetch
        /// - Lightweight health check for token status
        /// - CORS preflight validation
        /// </summary>
        /// <returns>Success message with user ID</returns>
        /// <response code="200">Token is valid</response>
        /// <response code="401">Token is invalid or expired</response>
        [HttpGet("validate")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public ActionResult ValidateToken()
        {
            try
            {
                var userId = _userService.GetUserIdFromClaims(User);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Invalid token: User ID claim not found" });
                }

                return Ok(new { message = "Token is valid", userId = userId });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error validating token: {ex.Message}");
                return Unauthorized(new { message = "Token validation failed" });
            }
        }

        /// <summary>
        /// Get the current user's roles
        /// 
        /// Endpoint: GET /api/users/me/roles
        /// Authentication: Required (Bearer token)
        /// 
        /// Returns a lightweight list of roles for authorization checks
        /// </summary>
        /// <returns>List of role names</returns>
        /// <response code="200">Successfully retrieved user roles</response>
        /// <response code="401">User is not authenticated</response>
        [HttpGet("me/roles")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(List<string>))]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<List<string>>> GetUserRoles()
        {
            try
            {
                var userId = _userService.GetUserIdFromClaims(User);

                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { message = "Invalid token" });
                }

                var roles = await _userService.GetUserRolesAsync(userId);

                return Ok(roles);
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error retrieving user roles: {ex.Message}");
                return StatusCode(
                    StatusCodes.Status500InternalServerError,
                    new { message = "Could not retrieve user roles" }
                );
            }
        }
    }
}
