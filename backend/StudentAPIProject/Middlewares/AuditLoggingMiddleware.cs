using Microsoft.AspNetCore.Http;
using System.Text.Json;

namespace Student_API_Project_v1.Middlewares
{
  public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLoggingMiddleware> _logger;

    public AuditLoggingMiddleware(RequestDelegate next, ILogger<AuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var originalBody = context.Response.Body;

        await using var memoryStream = new MemoryStream();
        context.Response.Body = memoryStream;

        try
        {
            // Call the next middleware
            await _next(context);

            // Read the response body
            memoryStream.Position = 0;
            var responseBody = await new StreamReader(memoryStream).ReadToEndAsync();

            // Optionally log response body
            _logger.LogInformation(
                "Response for {Path}: {StatusCode}, Body: {Body}",
                context.Request.Path,
                context.Response.StatusCode,
                responseBody
            );

            // Copy back to the original stream
            memoryStream.Position = 0;
            await memoryStream.CopyToAsync(originalBody);
        }
        finally
        {
            // Restore the original response body
            context.Response.Body = originalBody;
        }
    }
}

}