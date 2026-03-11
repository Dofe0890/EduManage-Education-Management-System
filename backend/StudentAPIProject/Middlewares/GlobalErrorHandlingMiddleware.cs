using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text.Json;
using System.Threading.Tasks;

namespace StudentAPIProject.Middlewares
{


    public class GlobalErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalErrorHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public GlobalErrorHandlingMiddleware(RequestDelegate next, ILogger<GlobalErrorHandlingMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled exception occurred");

                if (!context.Response.HasStarted)
                {
                    context.Response.Clear();
                    context.Response.ContentType = "application/json";

                    // Map exception type to status code and message
                    var (statusCode, message, errors) = MapException(ex);
                    context.Response.StatusCode = statusCode;

                    var response = new
                    {
                        message,
                        errors,
                        dev = _env.IsDevelopment() ? BuildDevDetails(ex) : null
                    };

var json = System.Text.Json.JsonSerializer.Serialize(response);

await context.Response.WriteAsync(json);                }
                else
                {
                    _logger.LogWarning("Cannot write error response because the response has already started.");
                }
            }
        }

        // Maps exceptions to status codes/messages
        private static (int StatusCode, string Message, object Errors) MapException(Exception ex)
        {
            return ex switch
            {
                KeyNotFoundException => (StatusCodes.Status404NotFound, ex.Message, null),
                UnauthorizedAccessException => (StatusCodes.Status401Unauthorized, "Access denied", null),
                ArgumentException => (StatusCodes.Status400BadRequest, ex.Message, null),
                InvalidOperationException => (StatusCodes.Status400BadRequest, ex.Message, null),
                FluentValidation.ValidationException fv => (
                    StatusCodes.Status400BadRequest,
                    "Validation failed",
                    fv.Errors.GroupBy(e => e.PropertyName)
                             .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray())
                ),
                _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred", null)
            };
        }

        // Include detailed exception info in development
        private static object BuildDevDetails(Exception ex)
        {
            return new
            {
                exception = ex.GetType().FullName,
                message = ex.Message,
                stackTrace = ex.StackTrace,
                innerException = ex.InnerException == null ? null : new
                {
                    exception = ex.InnerException.GetType().FullName,
                    message = ex.InnerException.Message,
                    stackTrace = ex.InnerException.StackTrace
                }
            };
        }
    }

}