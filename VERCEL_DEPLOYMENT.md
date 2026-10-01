# Deploy Kaarigar Expo to Vercel

The repository is prepared for a Vercel Services deployment: the Vite frontend and each Spring Boot HTTP service build as separate services in one Vercel project. The Eureka server is intentionally not deployed because Vercel service bindings provide the service URLs directly. Profile, product, and event images are uploaded directly to Vercel Blob; database records keep their public image URLs.

## Required before the first deployment

1. Import the GitHub repository `SharvariKarmalkar3244/Kaarigar-Expo` as a Vercel project, keeping the repository root as the project root. The Vite app, backend services, Dockerfiles, and root `vercel.json` are all in this repository.
2. Select **Services** as the framework. Vercel Services and containerized services must be enabled for the account/project.
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
| `GOOGLE_CLIENT_ID` | OAuth 2.0 web client ID from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | OAuth 2.0 web client secret; keep it only in Vercel environment settings |
| `GOOGLE_REDIRECT_URI` | Exact public callback URL, ending in `/login/oauth2/code/google` |
| `FRONTEND_URL` | Exact deployed frontend origin, used after OAuth completes |
| `EMAIL_ENABLED` | Set to `true` when an SMTP provider is configured |
| `EMAIL_FROM` | Verified sender address for account and event emails |
| `SMTP_HOST` / `SMTP_PORT` | SMTP server and port, typically port `587` with STARTTLS |
| `SMTP_USERNAME` / `SMTP_PASSWORD` | SMTP credentials stored only in deployment settings |
| `SMTP_AUTH` / `SMTP_STARTTLS` | Usually `true` for authenticated port 587 connections |
| `EVENT_REMINDERS_CRON` | Optional; defaults to 09:00 Asia/Kolkata each day |
| `MEDIA_STORAGE` | Set to `s3` to enable S3-compatible object storage; defaults to `database` |
| `S3_BUCKET` / `S3_REGION` | Object bucket name and region when using S3 storage |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | Optional when the runtime has an IAM role; otherwise provide storage credentials |
| `S3_ENDPOINT` | Optional endpoint for an S3-compatible provider |
| `CORS_ALLOWED_ORIGIN_PATTERN` | Optional; defaults to `https://*.vercel.app`. Set this to the production origin pattern if using a custom domain. |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob read/write token. Keep it in the frontend service's server-side environment; it is never exposed to browser code. |
| `VITE_MEDIA_STORAGE` | Set to `vercel-blob` in the frontend build environment to enable direct browser-to-Blob uploads. |

Generate secrets locally rather than putting them in source files. For example, Node.js can print a 48-byte Base64 value with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"`.

The Dockerfiles select the `vercel` Spring profile. Vercel injects the backend service-binding URLs at runtime; the root rewrites send `/api/*` to the gateway and other paths to the Vite frontend. The frontend API base URL remains same-origin.

## Database and media notes

Spring Data creates/updates the tables using the existing `ddl-auto=update` setting, including `media_assets` for images stored through the local/fallback media API. Existing data in a local PostgreSQL instance is not copied automatically: restore/import it into the hosted databases if you want to retain local accounts, events, applications, registrations, and tickets. Images that only exist in a local `uploads/` directory also need to be uploaded again. On Vercel, new uploads use Blob and only their public URLs are stored in application records.

Create a **public** Vercel Blob store because event, profile, and artisan portfolio images are displayed publicly. The frontend uses an authenticated Vercel Function to issue short-lived upload tokens, and the browser uploads image bytes directly to Blob. The function checks the user's JWT against the bound Auth service, restricts image type, account role, user-specific path, and 4 MB maximum size. Set `BLOB_READ_WRITE_TOKEN` and `VITE_MEDIA_STORAGE=vercel-blob` in Vercel. Local development keeps using the existing Kaarigar media API unless `VITE_MEDIA_STORAGE` is explicitly set.

Previously uploaded database media remains available at its existing API URL. New Blob uploads return Blob URLs which are stored in event/profile records.

The database credentials, JWT signing key, and internal service secret are required. The Vercel Spring profile does not fall back to the development credentials in `application.properties`.

For Google registration, create a Google OAuth 2.0 **Web application** client and add the exact `GOOGLE_REDIRECT_URI` as an authorized redirect URI. For local development, use `http://localhost:8081/login/oauth2/code/google` and set `FRONTEND_URL` to `http://localhost:5173`. OAuth-created accounts default to the Visitor role; Kaarigar accounts continue to use the role-specific registration form.

## Vercel project settings

- Root Directory: repository root (the directory containing this file and `vercel.json`).
- Framework Preset: Services.
- Keep the `vercel.json` rewrites and service names intact; the binding names are consumed by the Spring profile configuration.
- Add the variables to both Preview and Production if preview deployments should work.

## Deploy from this computer

Alternatively, install the Vercel CLI and sign in to the intended Vercel account, then run `vercel` from this project root to link it and create a preview. After setting the environment variables and checking the preview, run `vercel --prod` for production. This checkout is a root Git repository, but it has no Vercel project link or authenticated Vercel CLI session yet.
