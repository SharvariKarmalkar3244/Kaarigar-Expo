# Kaarigar Expo

Kaarigar Expo is a full-stack event and talent platform designed to connect visitors, artisans/worker profiles (Kaarigars), and administrators in a unified experience. The app enables event discovery, user registration, role-based dashboards, application management, and participant tracking across a modular Spring Boot microservice backend and a modern React frontend.

## Overview

This repository contains:

- A React + Vite frontend for the customer-facing web app
- A Java 21/Spring Boot microservices backend for authentication, event management, worker profiles, and visitor operations
- Service discovery and API gateway setup for internal routing
- Vercel-ready deployment configuration for the full stack

## Key Features

- Role-based access for Admin, Kaarigar, and Visitor users
- Public event browsing and event detail pages
- User registration and authentication
- Kaarigar application workflow
- Visitor registration and participation tracking
- Admin dashboard for managing events, applications, and attendees
- Check-in and participant management flow
- Responsive UI with Tailwind-based styling
- Microservice architecture for scalability and separation of concerns

## Tech Stack

Frontend
- React
- Vite
- JavaScript
- React Router
- Tailwind CSS
- Recharts and QR code utilities

Backend
- Java 21
- Spring Boot 4.x
- Spring Cloud
- Eureka Service Discovery
- API Gateway
- PostgreSQL-ready configuration

Deployment
- Vercel Services
- Dockerized backend services
- vercel.json routing setup

## Project Structure

```text
Kaarigar-Expo/
├── backend/
│   ├── api-gateway/
│   ├── auth-service/
│   ├── eureka-server/
│   ├── event-service/
│   ├── kaarigar-service/
│   ├── visitor-service/
│   ├── pom.xml
│   ├── Dockerfile.auth.vercel
│   ├── Dockerfile.event.vercel
│   ├── Dockerfile.gateway.vercel
│   ├── Dockerfile.kaarigar.vercel
│   ├── Dockerfile.visitor.vercel
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── README.md
│   └── ...
├── .gitignore
├── .vercelignore
├── VERCEL_DEPLOYMENT.md
├── vercel.json
├── README.md
└── ...
```

## Backend Services

The backend is organized as a Spring Cloud microservice ecosystem:

- Eureka Server: service discovery
- API Gateway: centralized routing and access control
- Auth Service: user authentication and authorization
- Event Service: event creation and management
- Kaarigar Service: Kaarigar profiles and job/application logic
- Visitor Service: visitor registrations and event participation

## Frontend App

The frontend is a React app structured around user role flows:

- Public routes: home, login, register, event listing, event details
- Admin routes: dashboard, applications, events, Kaarigars, visitors, check-in
- Kaarigar routes: dashboard, profile, applications
- Visitor routes: dashboard, registrations, profile

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18+ and npm
- Java 21
- Maven
- PostgreSQL (for the backend services)
- Git

Optional for deployment:
- Vercel account
- Docker

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

The frontend runs on the Vite dev server and is typically available at:

```text
http://localhost:5173
```

### 3. Backend setup

From the repository root:

```bash
cd backend
mvn clean install
```

Then start the required Spring Boot services individually, for example:

```bash
mvn spring-boot:run -pl eureka-server
mvn spring-boot:run -pl api-gateway
mvn spring-boot:run -pl auth-service
mvn spring-boot:run -pl event-service
mvn spring-boot:run -pl kaarigar-service
mvn spring-boot:run -pl visitor-service
```

If you are using the repository’s Vercel deployment setup, follow the instructions in `VERCEL_DEPLOYMENT.md` for required environment variables and service configuration.

## Environment Variables

For cloud deployment, the project expects environment variables for database access, service security, and JWT configuration. The deployment guide lists variables such as:

- AUTH_DATABASE_URL
- AUTH_DATABASE_USERNAME
- AUTH_DATABASE_PASSWORD
- EVENT_DATABASE_URL
- EVENT_DATABASE_USERNAME
- EVENT_DATABASE_PASSWORD
- KAARIGAR_DATABASE_URL
- KAARIGAR_DATABASE_USERNAME
- KAARIGAR_DATABASE_PASSWORD
- VISITOR_DATABASE_URL
- VISITOR_DATABASE_USERNAME
- VISITOR_DATABASE_PASSWORD
- JWT_SECRET
- INTERNAL_SERVICE_SECRET
- CORS_ALLOWED_ORIGIN_PATTERN

For local development, configure the appropriate Spring Boot `application.properties` or environment-specific values for each service as needed.

## Deployment

This project is prepared for deployment on Vercel using the Services framework. A full deployment guide is available in:

- `VERCEL_DEPLOYMENT.md`
- `vercel.json`

The repository includes Dockerfiles for the backend services and root-level routing configuration needed for deployment.

## Notes

- The Vercel deployment guide recommends using separate PostgreSQL databases for each backend service.
- The frontend validates upload size limits and the backend is designed for service-oriented data handling.
- The repository is structured as a monorepo with a clear separation between frontend and backend concerns.

## License

This repository does not currently declare a license in the root project files. If needed, add a license before public distribution.

## Contributing

Contributions are welcome. Please fork the repository, create a feature branch, and submit a pull request with a clear description of the changes.

## Contact

For questions or collaboration, please contact the repository owner or use the project’s GitHub repository discussions/issues as appropriate.
