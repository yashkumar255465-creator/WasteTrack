# Backend Dockerfile for .NET 8 Web API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["WasteTrack.API.csproj", "./"]
RUN dotnet restore "WasteTrack.API.csproj"

COPY . .
RUN dotnet publish "WasteTrack.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 5000
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "WasteTrack.API.dll"]
