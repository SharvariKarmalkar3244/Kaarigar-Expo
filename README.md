# Kaarigar Expo

Kaarigar Expo is an event and artisan platform that connects visitors, Kaarigars (artisans), and event administrators. Visitors can discover and register for events, artisans can build profiles and apply to participate, and administrators can manage events and verify entry tickets.

## Features

- Role-based accounts and dashboards for Visitors, Kaarigars, and Administrators
- Google OAuth registration and sign-in, plus email verification and password recovery
- Event discovery with search, location, date, craft, availability, and status filters
- Event registration and Kaarigar applications with approval workflows
- QR entry tickets, downloadable ticket details, and administrator check-in with duplicate-scan protection
- Artisan profiles, profile photos, and galleries of handmade work
- Event-specific images and light/dark themes
- Admin analytics for event capacity, applications, ticket issuance, and attendance
- Excel exports for administrative lists
- Audit history for important administrative actions
- Event reminder emails for ticket holders
- Pagination, event caching, downstream timeouts, and circuit breakers
- Optional image storage through Vercel Blob or an S3-compatible service

## Technology

| Area | Technologies |
| --- | --- |
| Frontend | React, Vite, React Router, Tailwind CSS, Axios, Recharts |
| Backend | Java 21, Spring Boot, Spring Cloud Gateway, Spring Security, Resilience4j |
| Databases | PostgreSQL, Spring Data JPA / Hibernate |
| Service discovery | Netflix Eureka for local development |
| Authentication | JWT and Google OAuth 2.0 |
| Image storage | PostgreSQL/local media, Vercel Blob, or S3-compatible storage |
| Deployment | Vercel Services for the frontend and backend containers |

## Architecture

The frontend calls the API Gateway. The gateway routes requests to the backend services, which each own their data and PostgreSQL database.

```text
React / Vite frontend
        |
        v
     API Gateway
        |
        +---- Auth Service ------ PostgreSQL: kaarigar_auth
        +---- Event Service ----- PostgreSQL: kaarigar_event
        +---- Kaarigar Service -- PostgreSQL: kaarigar_artisan
        +---- Visitor Service --- PostgreSQL: kaarigar_visitor

Eureka provides service discovery during local development.
Vercel service bindings replace Eureka for the Vercel deployment.
```

## Repository layout

```text
.
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── event-service/
│   ├── kaarigar-service/
│   ├── visitor-service/
│   └── eureka-server/
├── frontend/
├── scripts/                  # PostgreSQL backup script
├── .github/workflows/        # Scheduled backups and health checks
├── vercel.json               # Vercel services, bindings, and rewrites
├── VERCEL_DEPLOYMENT.md      # Vercel deployment instructions
└── OPERATIONS.md             # Email, storage, backup, and monitoring setup
```

## Run locally

### Prerequisites

- Java 21
- Node.js and npm (use a Node.js version supported by the Vite version in `frontend/package.json`)
- PostgreSQL
- A Google OAuth client if you want to test Google sign-in

### 1. Create the PostgreSQL databases

Create these four databases on your local PostgreSQL server:

```text
kaarigar_auth
kaarigar_event
kaarigar_artisan
kaarigar_visitor
```

The database URLs, usernames, and passwords are configured in each service's `src/main/resources/application.properties`. Update them for your local PostgreSQL setup. Do not commit real credentials or production secrets.

### 2. Start the backend services

Start each service in a separate terminal. Start Eureka first, then the services, and then the API Gateway.

```powershell
cd backend/eureka-server
.\mvnw.cmd spring-boot:run
```

In separate terminals, repeat with these module directories:

```text
backend/auth-service
backend/event-service
backend/kaarigar-service
backend/visitor-service
backend/api-gateway
```

Run the same command from each directory:

```powershell
.\mvnw.cmd spring-boot:run
```

The services use these local ports:

| Service | Port |
| --- | ---: |
| Eureka | 8761 |
| API Gateway | 8080 |
| Auth | 8081 |
| Events | 8082 |
| Kaarigar | 8083 |
| Visitor | 8084 |

### 3. Start the frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The development server proxies API requests to the Gateway.

### Optional local integrations

Google OAuth needs a Google OAuth 2.0 Web client. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`, configure `GOOGLE_REDIRECT_URI` as `http://localhost:8080/login/oauth2/code/google`, and set `FRONTEND_URL` to `http://localhost:5173`. Add the callback URL to the Google client’s authorized redirect URIs.

Email verification, password recovery, and event reminders need SMTP configuration. Set `EMAIL_ENABLED=true`, `EMAIL_FROM`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, and `SMTP_PASSWORD`. For local development email is disabled by default; configure a local SMTP catcher or another SMTP provider to receive messages.

## Admin access

Public registration supports Visitor and Kaarigar accounts. It does not allow users to register as Administrators. Admin access must be provisioned by an authorized project operator; do not expose database credentials or use a production account as a development shortcut.

## API overview

All browser-facing API requests go through the API Gateway at port `8080` in local development.

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Registration, sign-in, OAuth session lookup, email verification, and password recovery |
| `/api/events` | Event discovery, details, registration tickets, analytics, audit history, and check-in |
| `/api/kaarigars` | Artisan profiles and event applications |
| `/api/visitors` | Visitor profiles and event registrations |
| `/api/admin` | Administrator application review |

Service health endpoints are available at `/api/auth/health`, `/api/events/health`, `/api/kaarigars/health`, and `/api/visitors/health` through the Gateway.

## Deploy to Vercel

The repository includes a Vercel Services configuration. Deployment requires PostgreSQL databases, service environment variables, Google OAuth credentials, and (if using Vercel image storage) a Blob store token. Follow the detailed setup in [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md). Operational configuration for SMTP, backups, and health monitoring is in [OPERATIONS.md](OPERATIONS.md).

Keep secrets such as database credentials, `JWT_SECRET`, `INTERNAL_SERVICE_SECRET`, Google OAuth secrets, SMTP credentials, and `BLOB_READ_WRITE_TOKEN` in the deployment provider’s secret settings. Never commit them to source control.

## Backups and monitoring

GitHub Actions workflows can create encrypted PostgreSQL backups and check the deployed service health endpoints on a schedule. Configure the required GitHub repository secrets and variables described in [OPERATIONS.md](OPERATIONS.md) before enabling them.

## Notes

- Local Spring configuration is for development. Configure separate, strong secrets and database credentials for deployment.
- Existing local database contents and local-uploaded images are not transferred automatically during deployment.
- Vercel Blob uploads are available when `BLOB_READ_WRITE_TOKEN` is configured on the frontend service and `VITE_MEDIA_STORAGE=vercel-blob` is set for the frontend build.
