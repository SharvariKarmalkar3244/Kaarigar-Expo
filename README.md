# Kaarigar Expo

<<<<<<< ours
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
=======
Kaarigar Expo is a full-stack event and talent platform designed to connect visitors, artisans/worker profiles (Kaarigars), and administrators in a unified experience. The app enables event discovery, user registration, role-based dashboards, application management, and participant tracking across a modular Spring Boot microservice backend and a modern React frontend.

## Overview

This repository contains:

- A React + Vite frontend for the customer-facing web app
- A Java 21/Spring Boot microservices backend for authentication, event management, worker profiles, and visitor operations
- Service discovery and API gateway setup for internal routing
- Vercel-ready deployment configuration for the full stack

## Key Features

- **Role-based access** for Admin, Kaarigar, and Visitor users
- **Public event browsing** and event detail pages with discovery
- **User registration and authentication** with secure password policies
- **Kaarigar application workflow** for artisans to showcase work
- **Visitor registration and participation tracking** with entry QR codes
- **QR code generation** - After registration, visitors receive unique entry tickets as QR codes that can be:
  - Displayed directly in the app
  - Downloaded as high-quality PNG files for printing or offline use
  - Scanned for event check-in
- **Admin dashboard** for managing events, applications, and attendees
- **Check-in and participant management** flow with role-based controls
- **Responsive UI** with Tailwind-based styling
- **Microservice architecture** for scalability and separation of concerns

## Tech Stack

**Frontend**
- React 19
- Vite
- JavaScript (ES6+)
- React Router DOM for navigation
- Tailwind CSS for styling
- Recharts for data visualization
- QR Code (qrcode.react) for ticket generation
- Lucide React for icons
- Axios for API communication

**Backend**
- Java 21
- Spring Boot 4.1.1
- Spring Cloud 2025.1.3
- Eureka Server for service discovery
- Spring Cloud API Gateway for request routing
- PostgreSQL for data persistence
- Spring Data JPA for ORM

**Deployment**
- Vercel Services
- Dockerized backend microservices
- Multi-service routing via vercel.json

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Kaarigar Expo - Full Stack                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React + Vite)                          │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────────────────────┐  │
│  │  Public     │  │  Admin Portal    │  │  User Dashboards                │  │
│  │  ────────── │  │  ──────────────  │  │  ──────────────                 │  │
│  │ • Home      │  │ • Applications   │  │ • Visitor Dashboard             │  │
│  │ • Events    │  │ • Events         │  │ • Kaarigar Dashboard            │  │
│  │ • Login     │  │ • Kaarigars      │  │ • Profile Management            │  │
│  │ • Register  │  │ • Check-in       │  │ • Registrations + QR Tickets    │  │
│  └─────────────┘  │ • Participants   │  └─────────────────────────────────┘  │
│                   └──────────────────┘                                        │
│                    (All accessible via React Router)                          │
└──────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ HTTPS / REST API
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                   Vercel API Gateway + Service Routing                       │
│  ┌──────────────────────────────────────────────────────────────────────┐    │
│  │  vercel.json: Route /api/* → API Gateway, / → React Frontend         │    │
│  └──────────────────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────────────────┘
                                      ▲
                                      │ Service Binding
                                      ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                    Spring Cloud Microservices Backend                        │
│                                                                              │
│  ┌─────────────────┐      ┌──────────────────────────────────────────────┐  │
│  │  Eureka Server  │◄─────┤  Service Discovery & Registration            │  │
│  │                 │      │  (All services register on startup)          │  │
│  └─────────────────┘      └──────────────────────────────────────────────┘  │
│           ▲                                                                   │
│           │                                                                   │
│  ┌────────┴──────────┬────────────────┬────────────────┬─────────────────┐  │
│  │                   │                │                │                 │   │
│  ▼                   ▼                ▼                ▼                 ▼   │
│ ┌─────────────┐ ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌────────┐│
│ │  API        │ │ Auth         │ │ Event       │ │ Kaarigar     │ │Visitor ││
│ │  Gateway    │ │ Service      │ │ Service     │ │ Service      │ │Service ││
│ │             │ │              │ │             │ │              │ │        ││
│ │ • Routes    │ │ • JWT Auth   │ │ • Events    │ │ • Profiles   │ │• Regs  ││
│ │   requests  │ │ • Password   │ │ • Status    │ │ • Craft      │ │• QR    ││
│ │ • Auth      │ │   hash       │ │   mgmt      │ │   types      │ │• Ticket││
│ │   proxy     │ │ • User mgmt  │ │ • Created   │ │ • Portfolio  │ │  code  ││
│ │             │ │              │ │   events    │ │ • Listing    │ │        ││
│ └────────┬────┘ └──────┬───────┘ └────────┬────┘ └──────┬───────┘ └────┬───┘│
│          │             │                 │              │              │    │
└──────────┼─────────────┼─────────────────┼──────────────┼──────────────┼────┘
           │             │                 │              │              │
           ▼             ▼                 ▼              ▼              ▼
        ┌──────────────────────────────────────────────────────────────┐
        │  PostgreSQL Databases (4 Independent Per Service)            │
        │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
        │  │ Auth DB  │ │ Event DB │ │ Kaarigar │ │ Visitor  │         │
        │  │          │ │          │ │ DB       │ │ DB       │         │
        │  └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
        └──────────────────────────────────────────────────────────────┘
```

### Data Flow: Registration & QR Code Generation

```
┌────────────────────────────────────────────────────────────────────┐
│                    Visitor Registration Flow                       │
└────────────────────────────────────────────────────────────────────┘

1. VISITOR REGISTRATION
   ┌──────────────────────┐
   │ Frontend Register.jsx│
   │ • Form validation    │
   │ • Role selection     │
   │ • Password check     │
   └─────────┬────────────┘
             │ POST /auth/register
             ▼
   ┌──────────────────────┐
   │  Auth Service        │
   │ • Hash password      │
   │ • Create user record │
   │ • JWT token         │
   └─────────┬────────────┘
             │
             ▼
   ┌──────────────────────┐
   │  Visitor DB          │
   │ • Store profile      │
   └──────────────────────┘

2. EVENT REGISTRATION
   ┌──────────────────────┐
   │ EventDetails.jsx     │
   │ • Register for event │
   └─────────┬────────────┘
             │ POST /visitor/register/{eventId}
             ▼
   ┌──────────────────────┐
   │  Visitor Service     │
   │ • Create registration│
   │ • Generate ticket    │
   │   code (UUID)        │
   └─────────┬────────────┘
             │
             ▼
   ┌──────────────────────┐
   │  Visitor DB          │
   │ • Store registration │
   │ • Store ticketCode   │
   └──────────────────────┘

3. QR CODE GENERATION & DISPLAY
   ┌──────────────────────────────┐
   │ MyRegistrations.jsx          │
   │ • Fetch all registrations    │
   │ • Display in table           │
   │ • Show "Entry QR" button     │
   └─────────┬────────────────────┘
             │
             ▼
   ┌──────────────────────────────┐
   │ EntryTicketQr.jsx            │
   │ (qrcode.react library)       │
   │ ┌─────────────────────────┐  │
   │ │ QR Code (HTML Canvas)   │  │
   │ │ • Encodes: ticketCode   │  │
   │ │ • Display: 240x240 px   │  │
   │ │ • Level: M (15% recovery)  │
   │ └─────────────────────────┘  │
   │ ┌─────────────────────────┐  │
   │ │ Ticket Details          │  │
   │ │ • Event name            │  │
   │ │ • Date & Location       │  │
   │ │ • Attendee name         │  │
   │ │ • Ticket code           │  │
   │ └─────────────────────────┘  │
   │ ┌─────────────────────────┐  │
   │ │ Download Button         │  │
   │ │ Converts to PNG file    │  │
   │ └─────────────────────────┘  │
   └──────────────────────────────┘

4. CHECK-IN (Admin)
   ┌──────────────────────┐
   │ AdminCheckIn.jsx     │
   │ • Scan QR code       │
   │ • Extract ticketCode │
   └─────────┬────────────┘
             │ POST /admin/check-in
             ▼
   ┌──────────────────────┐
   │ Visitor Service      │
   │ • Mark attendance    │
   │ • Validate ticket    │
   └─────────┬────────────┘
             │
             ▼
   ┌──────────────────────┐
   │ Visitor DB           │
   │ • Update check-in    │
   │   status & time      │
   └──────────────────────┘
```

## Project Structure

```text
Kaarigar-Expo/
├── backend/                              # Spring Boot Microservices
│   ├── eureka-server/                   # Service Discovery (Netflix Eureka)
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── application.properties
│   │
│   ├── api-gateway/                     # API Gateway (Spring Cloud Gateway)
│   │   ├── src/
│   │   ├── pom.xml
│   │   └── Spring Gateway routing rules
│   │
│   ├── auth-service/                    # Authentication & User Management
│   │   ├── src/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   └── entity/
│   │   ├── pom.xml
│   │   └── Dockerfile.auth.vercel
│   │
│   ├── event-service/                   # Event Management
│   │   ├── src/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   └── entity/
│   │   ├── pom.xml
│   │   └── Dockerfile.event.vercel
│   │
│   ├── kaarigar-service/                # Kaarigar (Artisan) Profile Management
│   │   ├── src/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   └── entity/
│   │   ├── pom.xml
│   │   └── Dockerfile.kaarigar.vercel
│   │
│   ├── visitor-service/                 # Visitor Registration & Tickets
│   │   ├── src/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   └── entity/
│   │   │       └── Registration (with ticketCode)
│   │   ├── pom.xml
│   │   └── Dockerfile.visitor.vercel
│   │
│   ├── .postman/                        # Postman API Collections
│   ├── postman/
│   ├── pom.xml                          # Maven Parent POM
│   └── README.md
│
├── frontend/                             # React + Vite Web App
│   ├── src/
│   │   ├── api/                         # API client modules
│   │   │   ├── authApi.js
│   │   │   ├── eventApi.js
│   │   │   ├── kaarigarApi.js
│   │   │   ├── visitorApi.js
│   │   │   └── mediaApi.js
│   │   │
│   │   ├── components/                  # Reusable UI Components
│   │   │   ├── AccountMenu.jsx
│   │   │   ├── EntryTicketQr.jsx        # QR Code component
│   │   │   └── ...
│   │   │
│   │   ├── context/                     # React Context
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   │
│   │   ├── pages/                       # Page Components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   ├── admin/                   # Admin pages
│   │   │   │   ├── AdminDashboard.jsx
│   │   │   │   ├── AdminCheckIn.jsx
│   │   │   │   └── ...
│   │   │   ├── visitor/                 # Visitor pages
│   │   │   │   ├── VisitorDashboard.jsx
│   │   │   │   ├── MyRegistrations.jsx  # Shows registrations & QR codes
│   │   │   │   └── VisitorProfile.jsx
│   │   │   ├── kaarigar/                # Kaarigar pages
│   │   │   │   ├── KaarigarDashboard.jsx
│   │   │   │   ├── MyProfile.jsx
│   │   │   │   └── MyApplications.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetails.jsx
│   │   │   └── Profile.jsx
│   │   │
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── styles/                      # CSS & Theme
│   │   │   └── theme.css
│   │   │
│   │   ├── utils/                       # Utility functions
│   │   │
│   │   ├── App.jsx                      # Main App & Router
│   │   ├── main.jsx                     # React entry point
│   │   ├── index.css
│   │   └── App.css
│   │
│   ├── public/                          # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── eslint.config.js
│   ├── index.html
│   └── README.md
│
├── .gitignore
├── .vercelignore
├── vercel.json                          # Vercel Services routing config
├── VERCEL_DEPLOYMENT.md                 # Deployment guide
└── README.md                            # This file
```

## Backend Services

The backend is organized as a Spring Cloud microservice ecosystem:

### **Eureka Server**
- Service discovery and registration
- Central registry for all backend services
- Enables dynamic service-to-service communication

### **API Gateway**
- Centralized entry point for all requests
- Request routing based on paths (e.g., `/auth/*`, `/events/*`)
- Authentication and authorization proxy
- Load balancing between service instances

### **Auth Service**
- User registration and login
- JWT token generation and validation
- Password hashing (bcrypt)
- User role assignment
- Session management

### **Event Service**
- Create, read, update, and delete events
- Event status management
- Event listing with filters
- Event details and metadata

### **Kaarigar Service**
- Kaarigar profile creation and updates
- Craft type and portfolio management
- Kaarigar listings and search
- Application submission handling

### **Visitor Service**
- Visitor profile management
- Event registration for visitors
- **Ticket code generation** (UUID) for each registration
- Registration tracking and history
- QR code data serving to frontend

## Frontend App

The frontend is a React app structured around user role flows:

### **Public Routes**
- `/` - Home page
- `/login` - User login
- `/register` - User registration (role selection: Visitor or Kaarigar)
- `/events` - Event listing and discovery
- `/events/:id` - Event details and registration

### **Admin Routes**
- `/admin` - Admin dashboard with analytics
- `/admin/applications` - Manage Kaarigar applications
- `/admin/events` - Manage events
- `/admin/kaarigars` - Manage Kaarigars
- `/admin/events/:id/visitors` - View event visitors
- `/admin/check-in` - QR code-based check-in

### **Kaarigar Routes**
- `/kaarigar` - Kaarigar dashboard
- `/kaarigar/profile` - Edit profile and portfolio
- `/kaarigar/applications` - View applications

### **Visitor Routes**
- `/visitor` - Visitor dashboard
- `/visitor/registrations` - View registrations **with QR codes**
- `/visitor/profile` - Edit visitor profile

## QR Code Feature

After a visitor registers for an event, they receive a **unique entry ticket** with:

1. **Ticket Code** - A secure UUID generated by the backend
2. **QR Code Display** - Encoded ticket code using `qrcode.react` library
3. **Ticket Details** - Event name, date, location, attendee information
4. **Download Option** - Download ticket as high-quality PNG file
5. **Check-in Support** - QR code can be scanned by admins for event entry

### Entry Ticket QR Component (`EntryTicketQr.jsx`)
- Renders QR code canvas with event and attendee details
- Supports downloading as PNG (1000x1520px ticket format)
- Shows ticket code, event metadata, and instructions
- Expandable details panel for additional ticket information

## Prerequisites

Before running the project locally, make sure you have:

- **Node.js 18+** and **npm**
- **Java 21** (OpenJDK)
- **Maven 3.8+**
- **PostgreSQL 12+** (for backend services)
- **Git**

Optional for deployment:
- **Vercel CLI** and a Vercel account
- **Docker** (for containerizing services)

## Local Development Setup

### 1. Clone the repository

```bash
git clone https://github.com/SharvariKarmalkar3244/Kaarigar-Expo.git
cd Kaarigar-Expo
```

### 2. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the Vite dev server at:

```
http://localhost:5173
```

### 3. Backend setup

From the repository root:

```bash
cd backend
mvn clean install
```

Start the services (each in a separate terminal):

```bash
# Terminal 1: Eureka Server
mvn spring-boot:run -pl eureka-server

# Terminal 2: API Gateway
mvn spring-boot:run -pl api-gateway

# Terminal 3: Auth Service
mvn spring-boot:run -pl auth-service

# Terminal 4: Event Service
mvn spring-boot:run -pl event-service

# Terminal 5: Kaarigar Service
mvn spring-boot:run -pl kaarigar-service

# Terminal 6: Visitor Service
mvn spring-boot:run -pl visitor-service
```

### 4. Configure local environment

Update the `application.properties` or `application.yml` files in each backend service with:
- Database connection URLs (PostgreSQL)
- JWT secret key
- Internal service secret
- Service port configuration (default: Eureka 8761, Gateway 8080, others 8081+)

### 5. Access the app

- **Frontend:** http://localhost:5173
- **API Gateway:** http://localhost:8080/api
- **Eureka Dashboard:** http://localhost:8761

## Environment Variables

For cloud deployment, the project expects environment variables:

### Database Variables (per service)
```
AUTH_DATABASE_URL=jdbc:postgresql://HOST:5432/kaarigar_auth?sslmode=require
AUTH_DATABASE_USERNAME=auth_user
AUTH_DATABASE_PASSWORD=secure_password

EVENT_DATABASE_URL=jdbc:postgresql://HOST:5432/kaarigar_event?sslmode=require
EVENT_DATABASE_USERNAME=event_user
EVENT_DATABASE_PASSWORD=secure_password

KAARIGAR_DATABASE_URL=jdbc:postgresql://HOST:5432/kaarigar_kaarigar?sslmode=require
KAARIGAR_DATABASE_USERNAME=kaarigar_user
KAARIGAR_DATABASE_PASSWORD=secure_password

VISITOR_DATABASE_URL=jdbc:postgresql://HOST:5432/kaarigar_visitor?sslmode=require
VISITOR_DATABASE_USERNAME=visitor_user
VISITOR_DATABASE_PASSWORD=secure_password
```

### Security Variables
```
JWT_SECRET=<base64-encoded-256-bit-random-secret>
INTERNAL_SERVICE_SECRET=<long-random-shared-secret>
CORS_ALLOWED_ORIGIN_PATTERN=https://*.vercel.app (or your custom domain)
```

For local development, configure these in individual `application.properties` files within each service.

## Deployment

This project is prepared for deployment on **Vercel using the Services framework**. A complete deployment guide is available in:

- `VERCEL_DEPLOYMENT.md` - Step-by-step deployment instructions
- `vercel.json` - Service definitions and routing rules

The repository includes:
- **Dockerfiles** for each backend service (named `Dockerfile.*.vercel`)
- **Root rewrites** to route `/api/*` to the API Gateway and other paths to the Vite frontend
- **Environment variable management** for secure credential handling

### Key Deployment Notes

- Each backend service is deployed as a separate Vercel Function/Service
- PostgreSQL databases can be managed via Vercel Postgres or external provider
- Image uploads are capped at 4 MB due to Vercel function limits
- Frontend is automatically built and deployed on every commit

## Notes

- The Vercel deployment guide recommends using separate PostgreSQL databases for each backend service for isolation and scaling
- QR codes are generated client-side using the `qrcode.react` library and can be displayed or downloaded
- The repository is structured as a monorepo with clear separation between frontend and backend concerns
- All services support horizontal scaling in Vercel Functions environment
- Media uploads (images) are validated on the frontend and backend

## Language Composition

- **JavaScript**: 60.1% (Frontend code)
- **Java**: 38.1% (Backend microservices)
- **CSS**: 1.6% (Styling)
- **HTML**: 0.2% (Markup)

## License

This repository does not currently declare a license in the root project files. If needed, add a license before public distribution.

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request with a clear description of the changes

## Support & Contact

For questions, bug reports, or collaboration inquiries:
- Open an issue on the GitHub repository
- Contact the repository owner through GitHub
- Refer to existing documentation in `VERCEL_DEPLOYMENT.md` for deployment-specific help

---

**Built with ❤️ for connecting artisans and their audiences.**
>>>>>>> theirs
