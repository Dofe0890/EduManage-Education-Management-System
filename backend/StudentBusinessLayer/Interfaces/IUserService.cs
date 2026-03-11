using StudentBusinessLayer.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.Interfaces
{
    /// <summary>
    /// Service for handling authenticated user operations
    /// Provides secure methods to retrieve and manage current user information
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Retrieves the currently authenticated user's information from claims
        /// </summary>
        /// <param name="user">ClaimsPrincipal containing user claims from JWT token</param>
        /// <returns>CurrentUserDTO with user information, or null if user not found in database</returns>
        /// <exception cref="InvalidOperationException">Thrown when JWT claims are invalid or missing required claims</exception>
        Task<CurrentUserDTO> GetCurrentUserAsync(ClaimsPrincipal user);

        /// <summary>
        /// Extracts the user ID from the JWT claims
        /// </summary>
        /// <param name="user">ClaimsPrincipal containing JWT claims</param>
        /// <returns>User ID string from "uid" claim, or null if not present</returns>
        string GetUserIdFromClaims(ClaimsPrincipal user);

        /// <summary>
        /// Validates if a user exists in the database
        /// </summary>
        /// <param name="userId">The user ID to validate</param>
        /// <returns>True if user exists, false otherwise</returns>
        Task<bool> UserExistsAsync(string userId);

        /// <summary>
        /// Retrieves user roles by user ID
        /// </summary>
        /// <param name="userId">The user ID</param>
        /// <returns>List of role names assigned to the user</returns>
        Task<List<string>> GetUserRolesAsync(string userId);
    }
}
