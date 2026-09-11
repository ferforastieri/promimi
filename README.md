# Promimi

<p align="center"><img src="packages/design-system/src/brand/promimi.png" width="120" alt="Promimi" /></p>
<p align="center">Ofertas verificadas, cupons e automação de publicação para o público brasileiro.</p>

## O projeto

O Promimi reúne ofertas em um site público e dá à equipe um painel para conferir preços, organizar catálogo e publicar nos canais conectados.

```text
Site público e painel → API Promimi → PostgreSQL + fila → Worker → canais conectados
```

- **Site**: catálogo, busca, conta, favoritos e comentários.
- **Painel**: ofertas, categorias, integrações, rotinas e publicações.
- **API**: autenticação segura e regras do produto.
- **Worker**: automação, expiração e entrega nos canais.

## Arquitetura

É um monólito modular: um produto com módulos claros para catálogo, identidade, comunidade, automação, publicação e integrações.

```text
apps/      site, admin, api, worker e bridge WhatsApp opcional
packages/  design-system, query, database e config
```

## Desenvolvimento

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

Execute `pnpm verify` antes de enviar mudanças. Mais detalhes em [docs](docs/).
