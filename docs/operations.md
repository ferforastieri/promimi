# Operação

## Backup e restauração

Use `scripts/backup-postgres.sh` com um diretório fora do volume do banco. Teste periodicamente `scripts/restore-postgres.sh` em um banco isolado. Snapshot do provedor não substitui backup lógico.

## Observabilidade

Prometheus coleta métricas internas; `/health` da API verifica a conectividade com PostgreSQL. Investigue primeiro a saúde dos containers, as migrações e a fila de `outbox_events`/PgBoss.

## Entrega

O push em `main` executa `pnpm verify`, publica imagens e faz a atualização. Após um deploy, valide `GET /api/v1/health`, o site e o login com cookie.
