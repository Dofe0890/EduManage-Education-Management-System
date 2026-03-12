# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 as build
WORKDIR /source

# Copy solution and project files
COPY ["StudentAPIProject/Student API Project.csproj", "StudentAPIProject/"]
COPY ["StudentBusinessLayer/StudentBusinessLayer.csproj", "StudentBusinessLayer/"]
COPY ["StudentDataAccessLayer/StudentDataAccessLayer.csproj", "StudentDataAccessLayer/"]

# Restore dependencies
RUN dotnet restore "StudentAPIProject/Student API Project.csproj"

# Copy the rest of the code
COPY . .

# Build the application
RUN dotnet build "StudentAPIProject/Student API Project.csproj" -c Release -o /app/build

# Publish stage
FROM build as publish
RUN dotnet publish "StudentAPIProject/Student API Project.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 as final
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy published application
COPY --from=publish /app/publish .

# Expose port (Render uses PORT environment variable)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Entry point
ENTRYPOINT ["dotnet", "Student API Project.dll"]
