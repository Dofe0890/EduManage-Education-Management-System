namespace StudentAPIProject.Configuration
{
    public static class EnvironmentVariablesConfiguration
    {
        public static void ConfigureEnvironmentVariables(this WebApplicationBuilder builder)
        {
            // Override configuration with environment variables
            builder.Configuration.AddEnvironmentVariables();

            // Set default values for environment variables if not present
            var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") ?? 
                        builder.Configuration["JWT:Key"] ?? 
                        "your-default-jwt-key-change-this-in-production";

            var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD") ?? 
                           builder.Configuration["ConnectionStrings:DefaultPassword"] ?? 
                           "YourStrongPassword123!";

            // Update configuration with environment variables
            builder.Configuration["JWT:Key"] = jwtKey;
            
            // Update connection string with environment password
            var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
            if (!string.IsNullOrEmpty(dbPassword) && !string.IsNullOrEmpty(connectionString))
            {
                // Replace password in connection string
                connectionString = System.Text.RegularExpressions.Regex.Replace(
                    connectionString, 
                    @"Password=([^;]+)", 
                    $"Password={dbPassword}"
                );
                builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
            }
        }
    }
}
