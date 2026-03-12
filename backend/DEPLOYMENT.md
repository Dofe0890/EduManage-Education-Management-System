# EduManage Backend - Render Deployment Guide

## Prerequisites

- Render account (https://render.com)
- GitHub repository with your code pushed
- SQL Server database (Azure SQL Database, Azure SQL Managed Instance, or similar)
- All required secrets/credentials

## Deployment Steps

### 1. Create a New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in the service details:
   - **Name**: `edumange-backend` (or your preferred name)
   - **Environment**: `Docker`
   - **Budget**: Choose your plan
   - **Branch**: `main` (or your deployment branch)

### 2. Configure Environment Variables

Add the following environment variables in Render:

```
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=<your-sql-server-connection-string>
JWT__Key=<your-jwt-secret-key>
JWT__Issuer=<your-domain>
JWT__Audience=<your-domain>
JWT__DurationInMintues=60
CORS__ProductionUrl=https://edumange.vercel.app
```

**Important**: Replace placeholders with your actual values.

### 3. Connection String Format

Your SQL Server connection string should look like:

```
Server=<server-name>.database.windows.net;Database=<database-name>;User Id=<username>;Password=<password>;TrustServerCertificate=False;Connection Timeout=30;Encrypt=true;
```

### 4. Port Configuration

- The application listens on **port 8080**
- Render automatically exposes the port specified in `EXPOSE` directive
- Health check endpoint: `http://localhost:8080/health`

### 5. First Deployment

Once configured, Render will:

1. Detect the Dockerfile
2. Build the Docker image
3. Deploy the container
4. Monitor health checks

### 6. Database Migrations

**Important**: You need to handle database migrations before deployment.

**Option 1: Manual Migration (Recommended)**

```bash
# Run migrations locally before deployment
dotnet ef database update --project StudentDataAccessLayer
```

**Option 2: Automatic Migration (For Development)**
Modify `Program.cs` to auto-migrate on startup:

```csharp
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();
}
```

### 7. Troubleshooting

- **Health Check Failing**: Ensure the database is reachable
- **Connection String Error**: Verify database credentials and IP whitelisting
- **JWT Errors**: Check that all JWT variables are set correctly
- **CORS Issues**: Update `appsettings.Production.json` with your frontend URL

### 8. Health Check Endpoint

Add a health check endpoint to your `Program.cs`:

```csharp
// Add after building services
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }))
    .WithName("Health")
    .WithOpenApi()
    .AllowAnonymous();
```

### 9. Monitoring

- Monitor application logs in Render Dashboard
- Check Serilog output (configured in your app)
- Review performance metrics on Render

### 10. CORS Configuration Update

Update your `Program.cs` CORS policy for production:

```csharp
options.AddPolicy("ProductionPolicy", policy =>
{
    policy.WithOrigins(
        "https://edumange.vercel.app",  // Your production frontend
        "https://<your-render-domain>"  // Your Render domain
    )
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials();
});

// Use appropriate policy based on environment
var policy = app.Environment.IsProduction() ? "ProductionPolicy" : "DevelopmentPolicy";
app.UseCors(policy);
```

## Docker Build Locally (For Testing)

```bash
# Build the Docker image
docker build -t edumange-backend:latest .

# Run locally with environment variables
docker run -p 8080:8080 \
  -e "ConnectionStrings__DefaultConnection=<your-connection-string>" \
  -e "JWT__Key=<your-key>" \
  -e "JWT__Issuer=<your-issuer>" \
  -e "JWT__Audience=<your-audience>" \
  edumange-backend:latest
```

## Security Considerations

✅ HTTPS is enforced in production  
✅ JWT tokens with expiration  
✅ CORS properly configured  
✅ SQL Server encryption enabled  
✅ Health checks ensure availability

**Add these for extra security:**

- Enable database IP whitelisting for Render's IP range
- Use managed identity instead of connection strings when possible
- Implement rate limiting (already in your code)
- Keep secrets in environment variables, never in code

## Useful Links

- [Render Documentation](https://render.com/docs)
- [Docker Documentation](https://docs.docker.com)
- [.NET 8 Documentation](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-8)
- [Entity Framework Core](https://learn.microsoft.com/en-us/ef/core/)

## Support

For issues with Render deployment, check:

1. Application logs in Render dashboard
2. Database connectivity
3. Environment variables configuration
4. Docker build output
