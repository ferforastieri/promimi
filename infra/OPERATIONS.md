# Operação inicial

- Rode API, worker, site e painel como serviços distintos do Compose.
- Configure HTTPS e domínio no Caddy antes de expor as portas públicas.
- Defina `PUBLIC_API_URL` como a URL HTTPS pública da API (por exemplo, `https://api.seudominio.com`). Ela é usada no card SVG que a Meta busca para as publicações do Instagram; não use a URL interna `http://api:3001` nesse campo.
- Armazene `JWT_SECRET`, chave de criptografia e credenciais de integração em secrets do host, nunca no Git ou no banco.
- Ative `docker compose --profile monitoring up -d` para coletar `/metrics` da API no Prometheus. Monitore `/api/v1/health`, uso de disco/memória, fila pg-boss e estado das integrações. Uma desconexão do WhatsApp deve pausar apenas esse destino.
- Antes de produção, defina `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` uma única vez, entre no painel, ative TOTP e remova as duas variáveis do host.
- Para WhatsApp, suba o perfil isolado com `docker compose --profile whatsapp up -d`, abra `http://<host-interno>:3100/qr` em rede administrativa e escaneie com o número dedicado. A sessão fica no volume `whatsapp_session`; `GET /status` confirma `READY`. No painel, salve a integração `whatsapp` desativada com `bridgeUrl`, `bridgeToken` e `destinations` separados por vírgula; use **Validar destinos salvos** e só a ative quando todos os grupos/canais administrados retornarem válidos. Sem estado `READY`, o worker pausa apenas o WhatsApp.
- O painel permite pausar uma rotina, executar uma rotina manualmente e pausar a automação geral. A pausa geral preserva itens pendentes: ao retomar, o worker volta a conciliar a fila. Use a tela **Publicações** para pausar/retomar um destino específico e consultar tentativas e erros, sem afetar os demais destinos.
