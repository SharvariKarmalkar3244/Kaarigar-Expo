# Deploy Kaarigar Expo to Vercel

The repository is prepared for a Vercel Services deployment: the Vite frontend and each Spring Boot HTTP service build as separate services in one Vercel project. The Eureka server is intentionally not deployed because Vercel service bindings provide the service URLs directly. Uploaded profile, product, and event images are stored in the Kaarigar PostgreSQL database so they survive container restarts and scale-out.

## Required before the first deployment

1. Put the whole project in one Git repository with the repository root at this folder, or deploy this folder with the Vercel CLI. The current checkout has no Git repository at the project root; only `backend/` contains Git metadata, so importing that nested repository alone will omit the frontend and root Vercel configuration.
2. In Vercel, create a project from the root repository and select **Services** as the framework. Vercel Services and containerized services must be enabled for the account/project.
3. Create PostgreSQL databases for the four services. They can be four databases on one managed PostgreSQL instance. Copy the JDBC-form connection URL, username, and password for each into Vercel's Production and Preview environment variables.
4. Add these environment variables. Keep their values in Vercel's settings; do not commit them to this repository.

| Variable | Value |
| --- | --- |
| `AUTH_DATABASE_URL` | JDBC URL for the auth database, for example `jdbc:postgresql://HOST:5432/kaarigar_auth?sslmode=require` |
| `AUTH_DATABASE_USERNAME` | Auth database username |
| `AUTH_DATABASE_PASSWORD` | Auth database password |
| `EVENT_DATABASE_URL` | JDBC URL for the event database |
| `EVENT_DATABASE_USERNAME` | Event database username |
| `EVENT_DATABASE_PASSWORD` | Event database password |
| `KAARIGAR_DATABASE_URL` | JDBC URL for the Kaarigar database |
| `KAARIGAR_DATABASE_USERNAME` | Kaarigar database username |
| `KAARIGAR_DATABASE_PASSWORD` | Kaarigar database password |
| `VISITOR_DATABASE_URL` | JDBC URL for the visitor database |
| `VISITOR_DATABASE_USERNAME` | Visitor database username |
| `VISITOR_DATABASE_PASSWORD` | Visitor database password |
| `JWT_SECRET` | Base64-encoded secret with at least 256 bits of random data; use the same value for auth and gateway |
| `INTERNAL_SERVICE_SECRET` | Long random secret shared by the backend services |
| `CORS_ALLOWED_ORIGIN_PATTERN` | Optional; defaults to `https://*.vercel.app`. Set this to the production origin pattern if using a custom domain. |

Generate secrets locally rather than putting them in source files. For example, Node.js can print a 48-byte Base64 value with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"`.

The Dockerfiles select the `vercel` Spring profile. Vercel injects the backend service-binding URLs at runtime; the root rewrites send `/api/*` to the gateway and other paths to the Vite frontend. The frontend API base URL remains same-origin.

## Database and media notes

Spring Data creates/updates the tables using the existing `ddl-auto=update` setting, including `media_assets` for uploaded images. Existing data in a local PostgreSQL instance is not copied automatically: restore/import it into the hosted databases if you want to retain local accounts, events, applications, registrations, and tickets. Images that only exist in a local `uploads/` directory also need to be uploaded again; new uploads are stored in PostgreSQL.

Image uploads are capped at 4 MB because Vercel Functions limit request and response bodies to 4.5 MB. The frontend validates this before sending the upload.

The database credentials, JWT signing key, and internal service secret are required. The Vercel Spring profile does not fall back to the development credentials in `application.properties`.

## Vercel project settings

- Root Directory: repository root (the directory containing this file and `vercel.json`).
- Framework Preset: Services.
- Keep the `vercel.json` rewrites and service names intact; the binding names are consumed by the Spring profile configuration.
- Add the variables to both Preview and Production if preview deployments should work.

## Deploy from this computer

Install the Vercel CLI, sign in to the intended Vercel account, then run `vercel` from this project root to link it and create a preview. After setting the environment variables and checking the preview, run `vercel --prod` for production. The CLI deployment is not started automatically because this workspace has no Vercel CLI login, and the project has no root Git repository or Vercel project link.
