# Shop Web (React + .NET) Starter

## What is included
- Backend: `backend` solution with API project and service layers.
- Frontend: `frontend` React + Vite app.
- Roles: separate user and seller experience through role claim in JWT.
- Database: PostgreSQL only.
- Images: Cloudinary upload endpoint scaffold.
- Docker: `docker-compose.yml` with PostgreSQL service.

## Quick start
1. Copy `.env.example` to `.env` and fill secrets.
2. Keep PostgreSQL credentials in `.env` and use the provided connection string.
3. Build and run all services:
   - `docker compose up --build`

## Database setup
- Development connection string:
  - `Host=localhost;Port=5555;Database=shop;Username=shop_user;Password=shop_password`
- Install EF Core CLI if needed:
  - `dotnet tool install --global dotnet-ef`
- Create the initial migration from `backend`:
  - `dotnet ef migrations add InitialCreate --project .\src\Shopping.Infrastructure\Shopping.Infrastructure.csproj --startup-project .\src\Shopping.Api\Shopping.Api.csproj`
- Apply migrations to PostgreSQL:
  - `dotnet ef database update --project .\src\Shopping.Infrastructure\Shopping.Infrastructure.csproj --startup-project .\src\Shopping.Api\Shopping.Api.csproj`

## API routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/products` (Seller only)
- `POST /api/products/{productId}/images` (Seller only)
- `GET /api/orders/seller` (Seller only)
- `POST /api/orders/buyer`

## Frontend routes
- `/login`
- `/buyer`
- `/seller`

## Deploy to GCP Cloud Run
This repo can be deployed as a single Cloud Run service:
- React is built inside the Docker build.
- The built frontend files are copied into the ASP.NET Core app's `wwwroot`.
- ASP.NET Core serves both `/api/*` and the React SPA routes from the same container.

### Architecture
- `shopping-app` Cloud Run service: React frontend + .NET API
- Cloud SQL for PostgreSQL: application database
- Secret Manager: runtime secrets

### Required runtime settings
- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`
- `Cors__AllowedOrigins`
- `SuperAdmin__Email`
- `SuperAdmin__Password`
- `Cloudinary__CloudName`
- `Cloudinary__ApiKey`
- `Cloudinary__ApiSecret`

### Create Cloud SQL and secrets
Create a Cloud SQL for PostgreSQL instance in the same region as Cloud Run, then create the database and user your app will use.

Store the database connection string in Secret Manager as `DB_CONNECTION`:
```text
Host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME;Port=5432;Database=shop;Username=shop_user;Password=YOUR_DB_PASSWORD;SSL Mode=Disable
```

Create these secrets in Secret Manager:
- `DB_CONNECTION`
- `JWT_KEY`
- `SUPERADMIN_EMAIL`
- `SUPERADMIN_PASSWORD`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Build the container image
```bash
gcloud builds submit --config cloudbuild.cloudrun.yaml \
  --substitutions _IMAGE=REGION-docker.pkg.dev/PROJECT_ID/REPO/shopping-app:latest .
```

### Deploy to Cloud Run
```bash
gcloud run deploy shopping-app \
  --image REGION-docker.pkg.dev/PROJECT_ID/REPO/shopping-app:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME \
  --set-env-vars Jwt__Issuer=ShoppingApi,Jwt__Audience=ShoppingClient,Cors__AllowedOrigins=https://YOUR_CLOUD_RUN_URL \
  --set-secrets ConnectionStrings__DefaultConnection=DB_CONNECTION:latest,Jwt__Key=JWT_KEY:latest,SuperAdmin__Email=SUPERADMIN_EMAIL:latest,SuperAdmin__Password=SUPERADMIN_PASSWORD:latest,Cloudinary__CloudName=CLOUDINARY_CLOUD_NAME:latest,Cloudinary__ApiKey=CLOUDINARY_API_KEY:latest,Cloudinary__ApiSecret=CLOUDINARY_API_SECRET:latest
```

After deployment, the same Cloud Run URL serves:
- React app: `/`
- API: `/api/*`

### Database migration
Run the EF Core migration before first use:
```bash
cd backend
dotnet ef database update --project .\src\Shopping.Infrastructure\Shopping.Infrastructure.csproj --startup-project .\src\Shopping.Api\Shopping.Api.csproj
```

Run that command from an environment that can connect to your Cloud SQL instance, or temporarily use a public connection for migration.
