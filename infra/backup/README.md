# Backups

O agendamento do host deve executar `scripts/backup-postgres.sh` diariamente com `AGE_RECIPIENT` e `BACKUP_TARGET` definidos fora do repositório. A política do script mantém diários por sete dias e semanais por 28 dias. Restaurações devem ser ensaiadas antes de qualquer incidente.
