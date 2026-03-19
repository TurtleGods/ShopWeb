FROM node:22-bookworm-slim AS frontend-build
WORKDIR /frontend

COPY frontend/package.json ./
COPY frontend/package-lock.json ./
RUN npm ci
RUN npm install @rollup/rollup-linux-x64-gnu --no-save

COPY frontend ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend-build
WORKDIR /src

COPY backend/src/Shopping.Api/Shopping.Api.csproj backend/src/Shopping.Api/
COPY backend/src/Shopping.Application/Shopping.Application.csproj backend/src/Shopping.Application/
COPY backend/src/Shopping.Domain/Shopping.Domain.csproj backend/src/Shopping.Domain/
COPY backend/src/Shopping.Infrastructure/Shopping.Infrastructure.csproj backend/src/Shopping.Infrastructure/

RUN dotnet restore backend/src/Shopping.Api/Shopping.Api.csproj

COPY backend/src ./backend/src

RUN dotnet publish backend/src/Shopping.Api/Shopping.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
ENV ASPNETCORE_URLS=http://+:8080

COPY --from=backend-build /app/publish .
COPY --from=frontend-build /frontend/dist ./wwwroot

EXPOSE 8080
ENTRYPOINT ["dotnet", "Shopping.Api.dll"]
