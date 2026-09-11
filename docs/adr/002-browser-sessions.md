# ADR 002 — Sessão de navegador

Autenticação web usa JWT somente no cookie `HttpOnly`, `Secure` em produção e `SameSite=Lax`. Não há token em `localStorage`. Escritas com cookie exigem `Origin` permitido e as rotas sensíveis possuem limite de taxa próprio.
