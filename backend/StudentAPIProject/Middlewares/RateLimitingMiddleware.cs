using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;

namespace Student_API_Project_v1.Middlewares
{
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IMemoryCache _cache;
        private readonly RateLimitOptions _options;

        public RateLimitingMiddleware(RequestDelegate next, IMemoryCache cache, RateLimitOptions options = null)
        {
            _next = next;
            _cache = cache;
            _options = options ?? new RateLimitOptions();
        }

        public async Task Invoke(HttpContext context)
        {
            var clientIp = GetClientIpAddress(context);
            var cacheKey = $"rate_limit_{clientIp}";

            var clientStats = _cache.GetOrCreate(cacheKey, entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromSeconds(_options.WindowSeconds);
                return new ClientStats
                {
                    RequestCount = 0,
                    WindowStart = DateTime.UtcNow
                };
            });

            clientStats.RequestCount++;

            if (clientStats.RequestCount > _options.MaxRequests)
            {
                context.Response.StatusCode = StatusCodes.Status429TooManyRequests;
                context.Response.Headers["Retry-After"] = _options.WindowSeconds.ToString();
                
                await context.Response.WriteAsync($"Rate limit exceeded. Maximum {_options.MaxRequests} requests per {_options.WindowSeconds} seconds allowed.");
                return;
            }

            await _next(context);
        }

        private static string GetClientIpAddress(HttpContext context)
        {
            var xForwardedFor = context.Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xForwardedFor))
            {
                return xForwardedFor.Split(',')[0].Trim();
            }

            var xRealIp = context.Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(xRealIp))
            {
                return xRealIp;
            }

            return context.Connection.RemoteIpAddress?.ToString() ?? "Unknown";
        }
    }

    public class ClientStats
    {
        public int RequestCount { get; set; }
        public DateTime WindowStart { get; set; }
    }

    public class RateLimitOptions
    {
        public int MaxRequests { get; set; } = 100;
        public int WindowSeconds { get; set; } = 60;
    }
}
