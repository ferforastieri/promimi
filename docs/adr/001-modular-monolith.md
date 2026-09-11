# ADR 001 — Monólito modular

O Promimi é um monólito modular: API, worker, site, administração e bridge de WhatsApp são processos separados, mas os domínios permanecem no mesmo repositório e banco. A API monta módulos de `identity`, `catalog`, `community`, `automation`, `publishing`, `integrations` e `analytics`; módulos não chamam rotas uns dos outros.
