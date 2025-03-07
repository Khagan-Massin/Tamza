# Use Node.js to build the frontend
FROM node:18 AS frontend-builder

# Set working directory
WORKDIR /frontend

COPY TamzaFrontend/package.json .
COPY TamzaFrontend/package-lock.json .


# Use .NET SDK to build the backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-builder

# Set working directory
WORKDIR /backend

# Copy everything from the backend project into the container
COPY TamzaBackend/ .

# Restore dependencies (pull down NuGet packages)
RUN dotnet restore

# Build the backend application
RUN dotnet publish -c Release -o /publish

# Use a lighter .NET runtime image for running the backend
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Set working directory for runtime
WORKDIR /app

# Copy the published backend output from the build stage
COPY --from=backend-builder /publish .

# Copy the built frontend files from the frontend build stage
COPY --from=frontend-builder /frontend/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY TamzaFrontend/nginx.conf /etc/nginx/nginx.conf

# Expose ports for both frontend (80) and backend (8080)
EXPOSE 80
EXPOSE 8080

# Set environment variable for ASP.NET Core
ENV ASPNETCORE_URLS=http://*:8080

# Start both Nginx and the backend application
CMD ["sh", "-c", "nginx && dotnet TamzaBackend.dll"]