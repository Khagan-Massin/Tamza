# Use Node.js to build the project
FROM node:18 AS builder

# Set working directory
WORKDIR /TamzaFrontend

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY TamzaFrontend /TamzaFrontend

# Build the Vite project and set the backend URL look at the backend dockerfile so it matches and all that
RUN npm run build

# Use Nginx to serve the built files
FROM nginx:alpine

# Copy the built files from the previous stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration (optional)
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

##Stage 2 DOTNET
# Base image: Uses Microsoft's official .NET 9 SDK image for building
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build

# Set working directory inside the container
WORKDIR /TamzaBackend

# Copy everything from your project into the container
COPY /TamzaBackend /TamzaBackend

# Restore dependencies (pull down NuGet packages)
RUN dotnet restore

# Build the application
RUN dotnet publish -c Release -o /publish

# Runtime image: This is a **lighter** .NET 9 image, only for running the app (not for building it)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

# Set working directory for runtime
WORKDIR /app

# Copy the published output from the build stage
COPY --from=build /publish .

EXPOSE 8080
ENV ASPNETCORE_URLS=http://*:8080

#Run both Nginx and the .NET app
CMD ["nginx", "-g", "daemon off;"]
CMD ["dotnet", "TamzaBackend.dll"]
