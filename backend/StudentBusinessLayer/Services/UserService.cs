using Microsoft.AspNetCore.Identity;
using StudentBusinessLayer.DTOs;
using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.Services
{
    /// <summary>
    /// Service for managing authenticated user operations
    /// Extracts user information from JWT claims and database
    /// Implements security best practices by NOT exposing sensitive data
    /// </summary>
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        /// <summary>
        /// Retrieves the currently authenticated user's information
        /// Combines JWT claims with database data for a complete profile
        /// </summary>
        public async Task<CurrentUserDTO> GetCurrentUserAsync(ClaimsPrincipal user)
        {
            // Extract user ID from JWT claims (stored as "uid")
            var userId = GetUserIdFromClaims(user);

            if (string.IsNullOrEmpty(userId))
            {
                throw new InvalidOperationException("User ID claim is missing from JWT token");
            }

            // Fetch user from database to get profile information
            var applicationUser = await _userManager.FindByIdAsync(userId);

            if (applicationUser == null)
            {
                throw new InvalidOperationException($"User with ID '{userId}' not found in database");
            }

            // Get all roles assigned to the user
            var roles = await _userManager.GetRolesAsync(applicationUser);

            // Extract custom claims for permissions if available
            var claims = await _userManager.GetClaimsAsync(applicationUser);
            var permissionClaims = claims
                .Where(c => c.Type == "permission")
                .Select(c => c.Value)
                .ToList();

            // Build the DTO with security in mind
            var currentUserDTO = new CurrentUserDTO
            {
                UserId = applicationUser.Id,
                Username = applicationUser.UserName,
                Email = applicationUser.Email,
                FirstName = applicationUser.FirstName,
                LastName = applicationUser.LastName,
                FullName = $"{applicationUser.FirstName} {applicationUser.LastName}",
                Roles = roles.ToList(),
                Permissions = permissionClaims,
                EmailConfirmed = applicationUser.EmailConfirmed,
                LoadedAt = DateTime.UtcNow
            };

            return currentUserDTO;
        }

        /// <summary>
        /// Extracts the user ID from JWT claims
        /// The user ID is stored in the "uid" custom claim during JWT creation
        /// </summary>
        public string GetUserIdFromClaims(ClaimsPrincipal user)
        {
            // The "uid" claim is added during JWT token creation in AuthService
            var userIdClaim = user?.FindFirst("uid");

            if (userIdClaim == null)
            {
                // Fallback to NameIdentifier if "uid" is not present
                userIdClaim = user?.FindFirst(ClaimTypes.NameIdentifier);
            }

            return userIdClaim?.Value;
        }

        /// <summary>
        /// Validates if a user exists in the database
        /// Used for edge case handling
        /// </summary>
        public async Task<bool> UserExistsAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            return user != null;
        }

        /// <summary>
        /// Retrieves all roles assigned to a user
        /// </summary>
        public async Task<List<string>> GetUserRolesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new List<string>();
            }

            var roles = await _userManager.GetRolesAsync(user);
            return roles.ToList();
        }
    }
}
