# ADR 003 — Outbox transacional

O pedido de publicação cria registros de `publications` e `outbox_events` na mesma transação. O worker reivindica eventos pendentes, envia o job idempotente ao PgBoss e só então marca o evento como enviado. Falhas retornam o evento à fila com atraso.
