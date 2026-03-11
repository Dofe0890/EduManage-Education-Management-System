using System;
using System.Linq;

namespace StudentBusinessLayer.Common.Extensions
{
    public static class ValidationExtensions
    {
        /// <summary>
        /// Validates that orderBy parameter starts with a capital letter
        /// </summary>
        public static string FixAndValidateOrderBy(this string orderBy, string parameterName = "orderBy")
        {
            if (!string.IsNullOrWhiteSpace(orderBy) && !char.IsUpper(orderBy.First()))
            {
               return  orderBy = char.ToUpper(orderBy[0]) + orderBy.Substring(1);

            }
            return orderBy;
        }

        /// <summary>
        /// Validates that a string is not null or empty
        /// </summary>
        public static void ValidateNotNullOrEmpty(this string value, string parameterName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                throw new ArgumentException($"{parameterName} cannot be null or empty.", parameterName);
            }
        }

        /// <summary>
        /// Validates that a value is greater than zero
        /// </summary>
        public static void ValidateGreaterThanZero(this int value, string parameterName)
        {
            if (value <= 0)
            {
                throw new ArgumentException($"{parameterName} must be greater than 0.", parameterName);
            }
        }

        /// <summary>
        /// Validates that an object is not null
        /// </summary>
        public static void ValidateNotNull(this object value, string parameterName)
        {
            if (value == null)
            {
                throw new ArgumentNullException(parameterName, $"{parameterName} cannot be null.");
            }
        }
    }
}
