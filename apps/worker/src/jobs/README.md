# Jobs do worker

O processo mantém jobs explícitos e idempotentes: `dispatch-outbox`, `deliver-publication`,
`run-routine`, `reconcile-publications`, `expire-offers` e sincronização de cron. O outbox é
sempre a ponte entre uma mudança transacional da API e uma mensagem do PgBoss.
