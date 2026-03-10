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

## API routes
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/products`
- `POST /api/v1/products` (Seller only)
- `POST /api/v1/products/{productId}/images` (Seller only)
- `GET /api/v1/orders/seller` (Seller only)
- `POST /api/v1/orders/buyer`

## Frontend routes
- `/login`
- `/buyer`
- `/seller`
