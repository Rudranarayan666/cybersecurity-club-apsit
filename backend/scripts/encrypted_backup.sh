#!/bin/bash
# ==============================================================================
# encrypted_backup.sh — Encrypted PostgreSQL backup to S3 / local storage
# ==============================================================================
# Usage: ./scripts/encrypted_backup.sh
# Set up as cron job: 0 2 * * * /app/scripts/encrypted_backup.sh >> /var/log/backup.log 2>&1

set -euo pipefail

# ---- Configuration (override via environment) ----
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-cybersec_club}"
DB_USER="${DB_USER:-cybersec_admin}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgres}"
S3_BUCKET="${S3_BUCKET:-}"                     # Leave empty to skip S3 upload
ENCRYPTION_KEY="${BACKUP_ENCRYPTION_KEY:-}"    # GPG passphrase or leave empty to skip encryption
RETENTION_DAYS="${RETENTION_DAYS:-30}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cybersec_${DB_NAME}_${TIMESTAMP}.sql.gz"
ENCRYPTED_FILE="${BACKUP_FILE}.gpg"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] Starting backup: $BACKUP_FILE"

# ---- Step 1: Dump and compress ----
PGPASSWORD="${DB_PASSWORD}" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-password \
    --format=plain \
    --jobs=4 \
    | gzip > "${BACKUP_DIR}/${BACKUP_FILE}"

echo "[$(date)] Dump complete: $(du -sh ${BACKUP_DIR}/${BACKUP_FILE} | cut -f1)"

# ---- Step 2: Encrypt with GPG (AES-256) ----
if [ -n "$ENCRYPTION_KEY" ]; then
    echo "$ENCRYPTION_KEY" | gpg \
        --batch \
        --yes \
        --passphrase-fd 0 \
        --symmetric \
        --cipher-algo AES256 \
        --output "${BACKUP_DIR}/${ENCRYPTED_FILE}" \
        "${BACKUP_DIR}/${BACKUP_FILE}"
    
    # Remove unencrypted backup
    rm "${BACKUP_DIR}/${BACKUP_FILE}"
    FINAL_FILE="${ENCRYPTED_FILE}"
    echo "[$(date)] Encrypted: ${ENCRYPTED_FILE}"
else
    FINAL_FILE="${BACKUP_FILE}"
    echo "[$(date)] WARNING: Encryption key not set — backup is not encrypted!"
fi

# ---- Step 3: Upload to S3 (if configured) ----
if [ -n "$S3_BUCKET" ]; then
    aws s3 cp \
        "${BACKUP_DIR}/${FINAL_FILE}" \
        "s3://${S3_BUCKET}/backups/${FINAL_FILE}" \
        --sse aws:kms \
        --storage-class STANDARD_IA
    echo "[$(date)] Uploaded to s3://${S3_BUCKET}/backups/${FINAL_FILE}"
fi

# ---- Step 4: Remove old local backups ----
find "$BACKUP_DIR" -name "cybersec_*.sql.gz*" -mtime "+${RETENTION_DAYS}" -delete
echo "[$(date)] Cleaned backups older than ${RETENTION_DAYS} days"

echo "[$(date)] Backup complete: ${FINAL_FILE}"
