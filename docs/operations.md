# Operação

## Observabilidade

Prometheus coleta métricas internas; `/health` da API verifica a conectividade com PostgreSQL. Investigue primeiro a saúde dos containers, as migrações e a fila de `outbox_events`/PgBoss.

## Entrega

O push em `main` identifica os caminhos modificados. Documentação não gera imagens nem altera o servidor. Para código, o workflow valida os pacotes afetados, publica apenas as imagens necessárias e atualiza os serviços correspondentes. Alterações em `package.json`, lockfile, configurações compartilhadas ou banco são tratadas como impacto amplo.

O app Android é gerado como APK quando `MOBILE_SITE_URL` estiver cadastrada como variável pública do repositório. O valor deve ser a URL HTTPS pública do site; não use `localhost` ou a URL interna da API. Após um deploy de API, valide `GET /api/v1/health`, o site e o login com cookie.
