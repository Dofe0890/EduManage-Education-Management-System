using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace StudentBusinessLayer.DTOs
{
    /// <summary>
    /// Secure DTO for returning the currently authenticated user's information
    /// NEVER includes sensitive fields like PasswordHash, SecurityStamp, or Tokens
    /// </summary>
    public class CurrentUserDTO
    {
        /// <summary>
        /// Unique identifier for the user (from JWT "uid" claim)
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// User's username (from JWT "sub" claim)
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// User's email address (from JWT "email" claim)
        /// </summary>
        public string Email { get; set; }

        /// <summary>
        /// User's first name
        /// </summary>
        public string FirstName { get; set; }

        /// <summary>
        /// User's last name
        /// </summary>
        public string LastName { get; set; }

        /// <summary>
        /// Display name combining first and last name
        /// </summary>
        public string FullName { get; set; }

        /// <summary>
        /// List of roles assigned to the user (e.g., "Admin", "Teacher", "User")
        /// </summary>
        public List<string> Roles { get; set; } = new List<string>();

        /// <summary>
        /// List of permissions (if available in claims)
        /// Can be populated from custom claims
        /// </summary>
        public List<string> Permissions { get; set; } = new List<string>();

        /// <summary>
        /// Whether the email has been verified
        /// </summary>
        public bool EmailConfirmed { get; set; }

        /// <summary>
        /// Timestamp when the user profile was last loaded
        /// </summary>
        public DateTime LoadedAt { get; set; } = DateTime.UtcNow;
    }
}
