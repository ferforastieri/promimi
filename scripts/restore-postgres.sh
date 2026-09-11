#!/usr/bin/env bash
set -euo pipefail

backup_file=${1:?Informe o arquivo .sql.gz.age baixado do destino de backup.}
: "${AGE_IDENTITY:?Defina AGE_IDENTITY com a chave privada de restauração.}"
decrypted_file=$(mktemp /tmp/promimi-restore.XXXXXX.sql.gz)
trap 'rm -f "$decrypted_file"' EXIT
age -d -i "$AGE_IDENTITY" -o "$decrypted_file" "$backup_file"
gzip -dc "$decrypted_file" | docker compose exec -T postgres psql -v ON_ERROR_STOP=1 -U promimi promimi
