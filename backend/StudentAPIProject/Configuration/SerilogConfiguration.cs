using Serilog;
using Serilog.Events;

namespace StudentAPIProject.Configuration
{
    public static class SerilogConfiguration
    {
        public static void ConfigureSerilog(this WebApplicationBuilder builder)
        {
            builder.Host.UseSerilog((context, configuration) =>
                configuration.ReadFrom.Configuration(context.Configuration)
                    .MinimumLevel.Information()
                    .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
                    .MinimumLevel.Override("System", LogEventLevel.Warning)
                    .Enrich.FromLogContext()
                    .Enrich.WithProperty("Application", "StudentManagementAPI")
                    .WriteTo.Console()
                    .WriteTo.File(
                        path: "logs/student-api-.log",
                        rollingInterval: RollingInterval.Day,
                        retainedFileCountLimit: 30,
                        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Application} {RequestId} {Message:lj}{NewLine}{Exception}"
                    )
                    .WriteTo.File(
                        path: "logs/student-api-errors-.log",
                        rollingInterval: RollingInterval.Day,
                        restrictedToMinimumLevel: LogEventLevel.Error,
                        retainedFileCountLimit: 30,
                        outputTemplate: "[{Timestamp:yyyy-MM-dd HH:mm:ss} {Level:u3}] {Application} {RequestId} {Message:lj}{NewLine}{Exception}"
                    )
            );
        }
    }
}
