param(
    [string]$BackupDirectory = $(if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { Join-Path $env:LOCALAPPDATA "KaarigarExpoBackups" }),
    [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($env:PGHOST) -or [string]::IsNullOrWhiteSpace($env:PGUSER) -or [string]::IsNullOrWhiteSpace($env:PGPASSWORD)) {
    throw "Set PGHOST, PGUSER, and PGPASSWORD before running the backup."
}

$databases = if ($env:BACKUP_DATABASES) {
    $env:BACKUP_DATABASES.Split(",", [StringSplitOptions]::RemoveEmptyEntries) | ForEach-Object { $_.Trim() }
} else {
    @("kaarigar_auth", "kaarigar_event", "kaarigar_kaarigar", "kaarigar_visitor")
}

$BackupDirectory = [System.IO.Path]::GetFullPath($BackupDirectory)
New-Item -ItemType Directory -Path $BackupDirectory -Force | Out-Null
$stamp = [DateTime]::UtcNow.ToString("yyyyMMdd-HHmmss")

foreach ($database in $databases) {
    if ($database -notmatch "^[A-Za-z0-9_-]+$") { throw "Invalid database name in BACKUP_DATABASES." }
    $destination = Join-Path $BackupDirectory "kaarigar-$database-$stamp.dump"
    & pg_dump --host=$env:PGHOST --port=$(if ($env:PGPORT) { $env:PGPORT } else { "5432" }) --username=$env:PGUSER --dbname=$database --format=custom --no-owner --file=$destination
    if ($LASTEXITCODE -ne 0) { throw "pg_dump failed for database '$database' with exit code $LASTEXITCODE." }
}

$cutoff = [DateTime]::UtcNow.AddDays(-$RetentionDays)
Get-ChildItem -LiteralPath $BackupDirectory -Filter "kaarigar-*.dump" -File |
    Where-Object { $_.LastWriteTimeUtc -lt $cutoff } |
    ForEach-Object { Remove-Item -LiteralPath $_.FullName }
