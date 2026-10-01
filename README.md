# Kaarigar Expo

Kaarigar Expo connects event visitors, artisans (Kaarigars), and event administrators. It is a full-stack application with a React/Vite frontend and Spring Boot microservices backed by PostgreSQL.

## Features

- Role-based accounts for visitors, Kaarigars, and admins
- Google OAuth sign-in, email verification links, and password reset
- Event discovery with search, filters, and pagination
- Kaarigar profiles, craft portfolios, and event applications
- Visitor registrations with QR tickets and admin check-in
- Duplicate scan detection, admin analytics, and activity audit history
- Event reminder emails for ticket holders
- Toast notifications for user actions
- Event response caching and circuit breakers for service-to-service calls
- PostgreSQL database backups and Actuator health endpoints
- Optional S3-compatible storage for uploaded images

## Architecture

| Component | Local port | Purpose |
| --- | ---: | --- |
| React + Vite frontend | 5173 | Web interface |
| API Gateway | 8080 | Routes API requests and forwards verified user identity |
| Auth Service | 8081 | Accounts, JWT, Google OAuth, verification, password reset |
| Event Service | 8082 | Events, applications, tickets, analytics, reminders, audit log |
| Kaarigar Service | 8083 | Artisan profiles, portfolios, media |
| Visitor Service | 8084 | Visitor registrations and tickets |
| Eureka Server | 8761 | Local service discovery |

The four domain services use separate PostgreSQL databases: `kaarigar_auth`, `kaarigar_event`, `kaarigar_artisan`, and `kaarigar_visitor`. The gateway and Eureka server do not have application databases.

## Requirements

- Node.js and npm
- Java 21
- Maven
- PostgreSQL
- Google OAuth credentials and SMTP credentials for Google sign-in and email features

## Run locally

1. Create the four PostgreSQL databases listed above. The local Spring configuration uses PostgreSQL at `localhost:5432` with the `postgres` username and `admin` password; update the service `application.properties` files if your local credentials differ.
2. Start Eureka, Auth, Event, Kaarigar, Visitor, and API Gateway in separate terminals. In each terminal, first change to the `backend` directory, then run one of these commands:

   ```powershell
   mvn spring-boot:run -pl eureka-server
   mvn spring-boot:run -pl auth-service
   mvn spring-boot:run -pl event-service
   mvn spring-boot:run -pl kaarigar-service
   mvn spring-boot:run -pl visitor-service
   mvn spring-boot:run -pl api-gateway
   ```

3. Start the frontend in another terminal:

   ```powershell
   cd frontend
   npm install
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173). The Vite development proxy sends `/api` requests to the gateway.

Local email is disabled by default. Verification and password reset URLs are logged by the Auth Service so you can test them without an SMTP provider. Set Google OAuth credentials and SMTP settings to try those integrations end to end. See [OPERATIONS.md](OPERATIONS.md) for configuration details.

## Deployment

The repository includes Vercel Services configuration for the frontend, gateway, and backend services. Configure database, JWT, Google OAuth, SMTP, and optional object-storage environment variables in the hosting dashboard. Follow [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) for the full deployment steps and environment-variable list.

Do not commit production credentials. Generate a unique `JWT_SECRET` and `INTERNAL_SERVICE_SECRET`, and use a private secret manager for database, OAuth, SMTP, and storage credentials. The Vercel deployment expects the service-specific `*_DATABASE_URL`, `*_DATABASE_USERNAME`, and `*_DATABASE_PASSWORD` variables described in the deployment guide.

## Operations

- Configure SMTP for email verification, password resets, and event reminders.
- Configure S3-compatible storage with `MEDIA_STORAGE=s3` and the `S3_*` variables; database-backed image storage remains the default.
- Schedule `scripts/backup-postgres.ps1` to back up all four databases. Store a copy outside the machine that runs the script.
- Health and readiness endpoints are documented in [OPERATIONS.md](OPERATIONS.md). Keep monitoring endpoints private.

## Useful commands

```powershell
# Frontend production build
cd frontend
npm run build
npm run lint

# Package backend services
cd ../backend
mvn -DskipTests package
```

## Repository guides

- [Vercel deployment](VERCEL_DEPLOYMENT.md)
- [Operations, email, storage, and backups](OPERATIONS.md)
