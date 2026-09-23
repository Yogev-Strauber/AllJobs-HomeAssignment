FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["src/AllJobs.Api/AllJobs.Api.csproj", "src/AllJobs.Api/"]
COPY ["src/AllJobs.Application/AllJobs.Application.csproj", "src/AllJobs.Application/"]
COPY ["src/AllJobs.Domain/AllJobs.Domain.csproj", "src/AllJobs.Domain/"]
COPY ["src/AllJobs.Infrastructure/AllJobs.Infrastructure.csproj", "src/AllJobs.Infrastructure/"]

RUN dotnet restore "src/AllJobs.Api/AllJobs.Api.csproj"

COPY . .

RUN dotnet publish "src/AllJobs.Api/AllJobs.Api.csproj" \
    -c Release \
    -o /app/publish \
    --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 8080

ENTRYPOINT ["dotnet", "AllJobs.Api.dll"]