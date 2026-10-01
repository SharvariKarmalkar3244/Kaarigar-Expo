# Operations and production setup

## Email verification, password reset, and event reminders

The Auth and Event services use SMTP. Keep credentials in the host's secret manager or service environment:

- `EMAIL_ENABLED=true`
- `EMAIL_FROM=no-reply@your-domain.example`
- `SMTP_HOST`, `SMTP_PORT` (usually `587`), `SMTP_USERNAME`, `SMTP_PASSWORD`
- `SMTP_AUTH=true` and `SMTP_STARTTLS=true` when required by the mail provider
- `FRONTEND_URL=https://your-frontend-domain.example`

Action links expire after 30 minutes and only a SHA-256 token hash is stored. When local email is disabled, the Auth service logs the action URL for development. Do not disable email in a public deployment. Event reminders run daily at 09:00 Asia/Kolkata for ticket holders whose event starts the next day. Set `EVENT_REMINDERS_CRON` to change the schedule.

Google OAuth continues to require its client ID, secret, and exact public callback URL as described in `VERCEL_DEPLOYMENT.md`.

## Image object storage

The default `MEDIA_STORAGE=database` keeps the existing Postgres media behavior. To store new uploads in an S3-compatible bucket, set:

- `MEDIA_STORAGE=s3`
- `S3_BUCKET` and `S3_REGION`
- `S3_ACCESS_KEY` and `S3_SECRET_KEY`, or use the cloud host's IAM role
- Optional `S3_ENDPOINT` for an S3-compatible provider such as MinIO or an R2 endpoint

Existing image URLs continue to resolve from the database or local upload directory. New uploads use the selected storage backend.

## Admin analytics, check-in, and audit history

The admin dashboard reports event counts, pending artisan applications, ticket issuance, and check-ins. Its recent-activity table records event create/update/delete operations and first or duplicate ticket scans. A scan is serialized with a database row lock; repeat scans return an `alreadyCheckedIn` result and do not replace the original check-in time.

## Database backups

The script `scripts/backup-postgres.ps1` creates a custom-format `pg_dump` backup for each of the four default databases. Install PostgreSQL client tools, then configure `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, and optionally `BACKUP_DIR` / `BACKUP_DATABASES` for the Windows account used to run the task. Schedule the script daily with Windows Task Scheduler, for example:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File C:\path\to\kaarigar-expo\scripts\backup-postgres.ps1
```

Backups are retained locally for 14 days. Copy them to a separate storage location as part of the scheduled job; a backup on the same machine does not protect against machine or disk loss. Restore with `pg_restore --clean --if-exists --no-owner --dbname=TARGET_DATABASE BACKUP_FILE` after checking the target database.

## Health monitoring

The API Gateway and four data services expose Spring Actuator health and readiness/liveness probes at `/actuator/health`, `/actuator/health/readiness`, and `/actuator/health/liveness`. Probe them over the private service network or from the host's monitoring agent. Keep actuator routes off the public API gateway, and alert on repeated unhealthy results, elevated 5xx rates, and backup-job failures.
