FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY backend/src/Shopping.Api/Shopping.Api.csproj backend/src/Shopping.Api/
COPY backend/src/Shopping.Application/Shopping.Application.csproj backend/src/Shopping.Application/
COPY backend/src/Shopping.Domain/Shopping.Domain.csproj backend/src/Shopping.Domain/
COPY backend/src/Shopping.Infrastructure/Shopping.Infrastructure.csproj backend/src/Shopping.Infrastructure/

RUN dotnet restore backend/src/Shopping.Api/Shopping.Api.csproj

COPY backend/src ./backend/src

RUN dotnet publish backend/src/Shopping.Api/Shopping.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Shopping.Api.dll"]
