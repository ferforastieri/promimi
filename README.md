# Promimi

Portal brasileiro de promoções com curadoria, publicação manual e automações graduais.

## Rodar localmente

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

- Site público: `http://localhost:3000`
- Painel: `http://localhost:5173`
- API e documentação OpenAPI: `http://localhost:3001/docs`

Para executar a aceitação com serviços reais, migre e semeie o banco, inicie os processos e informe uma conta administrativa de teste. A conta pode ser criada no primeiro boot com `BOOTSTRAP_ADMIN_EMAIL` e `BOOTSTRAP_ADMIN_PASSWORD` (mínimo de 14 caracteres); não registre essa senha no Git.

```bash
pnpm db:migrate && pnpm db:seed
ACCEPTANCE_ADMIN_EMAIL=admin-de-teste@exemplo.test \
ACCEPTANCE_ADMIN_PASSWORD='uma-senha-longa-de-teste' \
pnpm test:acceptance
```

O roteiro testa catálogo e páginas públicas, bloqueio de visitante no painel, criação/publicação/expiração manual de oferta, favorito, comentário, denúncia, redirecionamento rastreável e solicitação de recuperação. A confirmação de e-mail e a redefinição completa dependem do SMTP real configurado; a entrega é registrada pela integração SMTP sem expor tokens em logs.

Antes de abrir uma mudança, execute `pnpm verify`. Ele confere o histórico das migrações Drizzle, tipagem, testes e builds de produção. A aceitação com serviços reais continua separada em `pnpm test:acceptance` para não esconder uma API ou banco indisponível.

## Estrutura

- `apps/site`: storefront SSR com React Router.
- `apps/admin`: painel Vite para a equipe.
- `apps/whatsapp`: processo isolado para QR, sessão persistente e envio WhatsApp.
- `apps/api`: API Fastify REST (`/api/v1`).
- `apps/worker`: filas pg-boss, publicação e revalidação.
- `packages/database`: Drizzle, esquema e migrações.
- `infra`: Compose, Caddy e operação de VPS.

Os conectores sociais e de marketplaces iniciam desligados até que suas credenciais sejam configuradas. Nenhuma chave é guardada no banco sem criptografia. Quando uma oferta já conhecida reaparece em uma fonte habilitada, o worker mantém o mesmo registro e atualiza preço, desconto verificável, cupom, imagem, expiração e horário de conferência; ela não é republicada como uma nova oferta.

## Integrações e app futuro

As integrações são configuradas no painel e testáveis com feeds JSON normalizados. Telegram usa Bot API; Meta usa API oficial e recebe por padrão um card SVG determinístico hospedado em `PUBLIC_API_URL` (ou uma imagem configurada pela equipe); WhatsApp é ativado no perfil Compose próprio e nunca bloqueia os demais destinos. A UI pública consome a API REST sem dependências do servidor no navegador, mantendo os componentes prontos para uma casca Capacitor SPA em uma fase de publicação nas lojas.
