#!/usr/bin/env bash
set -euo pipefail

# Requer AGE_RECIPIENT e BACKUP_TARGET (ex.: s3:bucket/promimi) fora do repositório.
# Também arquiva a sessão do WhatsApp quando o volume persistente existir.
backup_stamp=$(date -u +%Y-%m-%dT%H%M%SZ)
backup_file="/tmp/promimi-${backup_stamp}.sql.gz"
session_file="/tmp/promimi-${backup_stamp}-whatsapp-session.tar.gz"
trap 'rm -f "$backup_file" "$backup_file.age" "$session_file" "$session_file.age"' EXIT
docker compose exec -T postgres pg_dump -U promimi promimi | gzip > "$backup_file"
age -r "$AGE_RECIPIENT" -o "$backup_file.age" "$backup_file"
rclone copy "$backup_file.age" "$BACKUP_TARGET/daily/"
whatsapp_volume=${WHATSAPP_SESSION_VOLUME:-promimi_whatsapp_session}
if docker volume inspect "$whatsapp_volume" >/dev/null 2>&1; then
  docker run --rm -v "$whatsapp_volume:/data:ro" -v /tmp:/backup busybox sh -c "tar -C /data -czf /backup/$(basename "$session_file") ."
  age -r "$AGE_RECIPIENT" -o "$session_file.age" "$session_file"
  rclone copy "$session_file.age" "$BACKUP_TARGET/daily/"
fi
if [ "$(date -u +%u)" = "7" ]; then
  rclone copy "$backup_file.age" "$BACKUP_TARGET/weekly/"
  [ -f "$session_file.age" ] && rclone copy "$session_file.age" "$BACKUP_TARGET/weekly/"
fi
rclone delete "$BACKUP_TARGET/daily" --min-age 7d
rclone delete "$BACKUP_TARGET/weekly" --min-age 28d
