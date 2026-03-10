FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY src/Shopping.Api/Shopping.Api.csproj src/Shopping.Api/
COPY src/Shopping.Application/Shopping.Application.csproj src/Shopping.Application/
COPY src/Shopping.Domain/Shopping.Domain.csproj src/Shopping.Domain/
COPY src/Shopping.Infrastructure/Shopping.Infrastructure.csproj src/Shopping.Infrastructure/

RUN dotnet restore src/Shopping.Api/Shopping.Api.csproj

COPY src/Shopping.Api ./src/Shopping.Api
COPY src/Shopping.Application ./src/Shopping.Application
COPY src/Shopping.Domain ./src/Shopping.Domain
COPY src/Shopping.Infrastructure ./src/Shopping.Infrastructure

RUN dotnet publish src/Shopping.Api/Shopping.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "Shopping.Api.dll"]

