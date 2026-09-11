# Segurança operacional

- Cookies de sessão são HttpOnly e não são legíveis por JavaScript.
- CORS aceita somente as origens configuradas; escritas autenticadas verificam `Origin`.
- Helmet, CSP, HSTS e cabeçalhos defensivos são aplicados pela API/Caddy.
- Credenciais de integração são cifradas antes da persistência e nunca retornam pela API.
- O usuário de deploy é separado de `root`; chaves e segredos permanecem no GitHub/VPS, nunca no repositório.
- Revogue tokens de fornecedor e altere segredos se forem expostos em terminal, chat ou log.
