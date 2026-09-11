#!/usr/bin/env bash
set -euo pipefail

# Restore only while the WhatsApp service is stopped, otherwise its session files
# may be overwritten while chromium is using them.
backup_file=${1:?Informe o arquivo .tar.gz.age da sessão do WhatsApp.}
: "${AGE_IDENTITY:?Defina AGE_IDENTITY com a chave privada de restauração.}"
whatsapp_volume=${WHATSAPP_SESSION_VOLUME:-promimi_whatsapp_session}
decrypted_file=$(mktemp /tmp/promimi-whatsapp-restore.XXXXXX.tar.gz)
trap 'rm -f "$decrypted_file"' EXIT
age -d -i "$AGE_IDENTITY" -o "$decrypted_file" "$backup_file"
docker volume create "$whatsapp_volume" >/dev/null
docker run --rm -v "$whatsapp_volume:/data" -v "$decrypted_file:/backup/session.tar.gz:ro" busybox sh -c 'rm -rf /data/* /data/.[!.]* /data/..?* 2>/dev/null || true; tar -C /data -xzf /backup/session.tar.gz'
