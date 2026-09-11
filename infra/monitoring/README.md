# Monitoramento

Prometheus usa `infra/prometheus/prometheus.yml` e coleta `/metrics` da API. A disponibilidade pública deve ser acompanhada com `/health`; alertas de produção devem cobrir erro de healthcheck, reinício de container, atraso de outbox e falha de backup.
