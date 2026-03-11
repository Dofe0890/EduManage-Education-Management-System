using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using StudentBusinessLayer.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Text;
using System.Threading.Tasks;

namespace StudentAPIProject.Middlewares
{
    public class RefreshTokenMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly IServiceProvider _serviceProvider;

        public RefreshTokenMiddleware(RequestDelegate next, IServiceProvider serviceProvider)
        {
            _next = next;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            var authorizationHeader = context.Request.Headers.Authorization.FirstOrDefault();
            
            if (string.IsNullOrEmpty(authorizationHeader) || !authorizationHeader.StartsWith("Bearer "))
            {
                await _next(context);
                return;
            }

            var token = authorizationHeader.Substring("Bearer ".Length);
            
            if (!IsTokenExpired(token))
            {
                await _next(context);
                return;
            }

            var refreshToken = context.Request.Cookies["RefreshToken"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                await _next(context);
                return;
            }

            using (var scope = _serviceProvider.CreateScope())
            {
                var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();
                
                var newJwtToken = await authService.RefreshJwtAsync(refreshToken);
                
                if (!string.IsNullOrEmpty(newJwtToken))
                {
                    context.Response.Headers.Authorization = $"Bearer {newJwtToken}";
                    
                    context.Request.Headers.Authorization = $"Bearer {newJwtToken}";
                }
            }

            await _next(context);
        }

        private bool IsTokenExpired(string token)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var jwtToken = tokenHandler.ReadJwtToken(token);
                
                return jwtToken.ValidTo < DateTime.UtcNow;
            }
            catch
            {
                return true;
            }
        }
    }
}
