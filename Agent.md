# AGENT.md

## Project Vision
- Build a shopping web platform with:
  - Frontend: React (TypeScript preferred), route-based UI.
  - Backend: ASP.NET Core Web API (.NET 8+), clean layered architecture.
  - Auth: Separate entry experiences for **buyer/user** and **seller/admin**.
  - Data: PostgreSQL database, with Dockerized local dev environment.
  - Media: Cloudinary for image upload, transformation, and delivery.

## Recommended Repository Layout
- `backend/` – ASP.NET Core solution
  - `Shopping.sln`
  - `src/Shopping.Api/` (controllers, DTOs, middleware, auth endpoints)
  - `src/Shopping.Application/` (business logic/services)
  - `src/Shopping.Domain/` (entities, enums, interfaces)
  - `src/Shopping.Infrastructure/` (EF Core, repositories, Cloudinary, file storage)
  - `tests/` (unit/integration tests)
- `frontend/` – React app
  - `src/pages/` (`Auth`, `Products`, `Cart`, `Seller`, `Orders`, `Dashboard`)
  - `src/features/` (auth, product, cart, order, seller)
  - `src/shared/` (components, hooks, services, auth context)
- `infra/` – Docker and infra helpers
  - `docker/docker-compose.yml`
  - `docker/db/` (init scripts, seed data)
- `docs/` – PRDs, API docs, DB schema, deployment notes

## Non-Negotiable Technical Decisions
- Use JWT-based authentication with role claims for at least:
  - `Buyer`
  - `Seller`
  - `Admin` as the super user role
- API should expose role-gated endpoints:
  - User pages use public + `Buyer` scope endpoints.
  - Seller pages use `Seller` scope endpoints.
  - Admin pages and APIs use `Admin` scope endpoints.
- Frontend must prevent cross-role UI bleed:
  - login route chooses role-specific landing route.
  - seller-only pages hide/deny access if token role mismatch.
  - admin-only pages hide/deny access if token role mismatch.
- Data model should start with:
  - User
  - Role
  - Product
  - ProductImage
  - Order
  - OrderItem
  - Cart
  - Payment (stubbed for now)
- Use EF Core with migrations and dependency injection.
- Public registration only creates `Buyer` accounts.
- `Seller` accounts are created and managed by `Admin`.
- API controllers must not return EF Core entities directly.
  - Always return DTOs, anonymous projections, or dedicated response models.
  - This avoids lazy navigation leakage and JSON reference-cycle errors such as `Seller -> Products -> Seller`.

## Local Database Strategy (Docker)
- Use PostgreSQL as the only database for development.
- Required environment variables:
  - `ConnectionStrings__DefaultConnection` in backend app settings.

Suggested local compose services:
- `db`:
  - PostgreSQL: `postgres:16`
- `api`: ASP.NET Core backend, connects using env/secret connection string.
- `web`: React dev server (later static build can be served separately in production).

## Cloudinary Strategy
- Bind Cloudinary settings from configuration section `Cloudinary`.
  - `Cloudinary:CloudName`
  - `Cloudinary:ApiKey`
  - `Cloudinary:ApiSecret`
- Environment variables may override appsettings values using:
  - `Cloudinary__CloudName`
  - `Cloudinary__ApiKey`
  - `Cloudinary__ApiSecret`
- Upload flow:
  1. Frontend gets user image file and token.
  2. API receives upload request (seller context only).
  3. API uploads to Cloudinary and stores returned URL/publicId in `ProductImage`.
- Never commit `.env` or secrets.

## Page/Route Requirements
- Authentication
  - `/login` (entry login with role select or role inferred from account)
  - `/buyer` -> user home/storefront
  - `/seller` -> seller dashboard
  - `/admin` -> super user dashboard
  - `/register` (buyer onboarding only)
- Buyer pages
  - Product browse/search/detail
  - Cart/Checkout scaffolding
  - Orders history
- Seller pages
  - Product CRUD
  - Inventory
  - Incoming orders
  - Sales summary
- Admin pages
  - User management
  - Seller account creation
  - User activation/deactivation

## Developer Defaults
- Language: TypeScript for frontend, C# for backend.
- Git policy: small, role-based commits.
- API style: versioned endpoints (`/api/v1/...`) and DTO-centric contracts.
- Error format: consistent JSON response with code/message.
- Use HTTPS in local/dev flows where possible.
- Application configuration should be read through ASP.NET Core configuration binding, not by manually reading config files from lower layers.
- Development startup may use `launchSettings.json`, but environment variables override `appsettings.Development.json`.

## Super Admin Bootstrap
- Bootstrap the super user at application startup.
- Read settings from configuration section `SuperAdmin`:
  - `SuperAdmin:Email`
  - `SuperAdmin:Password`
  - `SuperAdmin:FullName`
- Environment variable equivalents:
  - `SuperAdmin__Email`
  - `SuperAdmin__Password`
  - `SuperAdmin__FullName`
- If email or password is missing, skip bootstrap.
- If the user exists, normalize it to active `Admin`.
- If the user does not exist, create it automatically.

## Initial Task Order
1. Scaffold backend API + domain/application/infrastructure.
2. Scaffold React app and auth shell.
3. Implement login + role redirect.
4. Add EF Core models + migrations for base entities.
5. Add Cloudinary image upload endpoint and product creation flow.
6. Add buyer storefront + cart basics.
7. Add seller dashboard + order management.

## Future Hardening (Phase 2)
- Refresh token flow
- Payment integration (e.g., Stripe)
- Search/filter/index tuning
- CDN and caching policy
- Monitoring and structured logs
