using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using StudentDataAccessLayer.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using StudentBusinessLayer.Interfaces;
using StudentDataAccessLayer.Repository;
using StudentBusinessLayer.Services;
using StudentBusinessLayer.Helper;
using StudentDataAccessLayer.Interfaces;
using StudentBusinessLayer.Mappings;
using Microsoft.Extensions.DependencyInjection;
using Student_API_Project_v1.Middlewares;
using StudentAPIProject.Middlewares;
using System.Security.Claims;
using FluentValidation;
using StudentBusinessLayer.Validation;
using StudentBusinessLayer.DTOs;
using Microsoft.AspNetCore.Mvc;
using FluentValidation.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();


// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("DevelopmentPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "http://localhost:4200", "http://localhost:5000", "http://localhost:5176")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
    
    options.AddPolicy("ProductionPolicy", policy =>
    {
        policy.WithOrigins("https://edumange.vercel.app") // Replace with your production domain
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure JWT
builder.Services.Configure<JWT>(builder.Configuration.GetSection("JWT"));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString, b => b.MigrationsAssembly("StudentDataAccessLayer")));

var jwtSetting = builder.Configuration.GetSection("JWT").Get<JWT>();

if (jwtSetting == null)
{
    throw new InvalidOperationException("JWT configuration section is missing or invalid.");
}

builder.Services.AddAuthentication(option =>
{
    option.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    option.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(option =>
{
    option.SaveToken = false;
    option.RequireHttpsMetadata = builder.Environment.IsProduction(); // Only require HTTPS in production
    option.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSetting.Issuer,
        ValidAudience = jwtSetting.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSetting.Key)),
        ClockSkew = TimeSpan.FromMinutes(10),
        RoleClaimType = ClaimTypes.Role
    };
    option.Events = new JwtBearerEvents
    {
        OnChallenge = async context =>
        {
            context.HandleResponse();

            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(new
            {
                statusCode = 401,
                message = "Unauthorized. Invalid or missing token."
            });
        },

        OnForbidden = async context =>
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            context.Response.ContentType = "application/json";

            await context.Response.WriteAsJsonAsync(new
            {
                statusCode = 403,
                message = "Forbidden. You do not have permission."
            });
        }
    };
});

// Add memory cache for rate limiting
builder.Services.AddMemoryCache();



builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.InvalidModelStateResponseFactory = context =>
    {
        var errors = context.ModelState
            .Where(x => x.Value.Errors.Any())
            .ToDictionary(
                x => x.Key,
                x => x.Value.Errors.Select(e => e.ErrorMessage).ToArray()
            );

        return new BadRequestObjectResult(new
        {
            statusCode = 400,
            message = "Validation failed",
            errors
        });
    };
});


// Add API versioning
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new Microsoft.AspNetCore.Mvc.ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;
});

builder.Services.AddVersionedApiExplorer(options =>
{
    options.GroupNameFormat = "'v'VVV";
    options.SubstituteApiVersionInUrl = true;
});

builder.Services.AddAutoMapper(cfg =>
{
    cfg.AddProfile<MappingProfile>();
});

builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ITeacherService, TeacherService>();
builder.Services.AddScoped<IUserManagementService, UserManagementService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IClassroomService, ClassroomService>();
builder.Services.AddScoped<IAttendancesService, AttendanceService>();
builder.Services.AddScoped<ISubjectService, SubjectService>();
builder.Services.AddScoped<IGradesService, GradesService>();

// Configure rate limiting options
builder.Services.Configure<RateLimitOptions>(builder.Configuration.GetSection("RateLimit"));

builder.Services.AddAuthorization();
builder.Services.AddControllers();

var app = builder.Build();



app.UseMiddleware<GlobalErrorHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment()) 
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS BEFORE security headers
if (app.Environment.IsDevelopment())
{
    app.UseCors("DevelopmentPolicy");
}
else
{
    app.UseCors("ProductionPolicy");
}

// Add security headers middleware AFTER CORS
app.UseMiddleware<SecurityHeadersMiddleware>();

// Add audit logging middleware
app.UseMiddleware<AuditLoggingMiddleware>();

// Add rate limiting middleware
app.UseMiddleware<RateLimitingMiddleware>();

// Add refresh token middleware
app.UseMiddleware<RefreshTokenMiddleware>();

app.UseRouting();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint (for Docker health checks and monitoring)
app.MapGet("/health", async (ApplicationDbContext dbContext) =>
{
    try
    {
        // Try to connect to the database
        await dbContext.Database.ExecuteSqlRawAsync("SELECT 1");
        return Results.Ok(new 
        { 
            status = "healthy", 
            timestamp = DateTime.UtcNow,
            environment = app.Environment.EnvironmentName
        });
    }
    catch (Exception ex)
    {
        return Results.StatusCode(503, new 
        { 
            status = "unhealthy", 
            message = "Database connection failed",
            timestamp = DateTime.UtcNow
        });
    }
})
.WithName("Health")
.WithOpenApi()
.AllowAnonymous();

app.MapControllers();

app.Run();
