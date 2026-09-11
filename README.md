# Promimi

<p align="center">
  <img src="packages/design-system/src/brand/promimi.png" width="144" alt="Logo do Promimi" />
</p>

<p align="center">
  <strong>Ofertas confiáveis, cupons e publicação automática em um só lugar.</strong><br />
  Uma plataforma brasileira para descobrir boas oportunidades e permitir que a equipe as publique com controle.
</p>

---

## O que é o Promimi?

O Promimi é um portal de promoções. Para quem visita, ele oferece um lugar simples para encontrar ofertas, buscar produtos, salvar favoritos, usar cupons e participar dos comentários. Para a operação, entrega um painel administrativo que concentra a curadoria do catálogo, a moderação da comunidade e as integrações de publicação.

Em termos simples: uma oferta entra, é revisada pela equipe, fica disponível no site e pode ser distribuída automaticamente para os canais configurados.

```text
Oferta → revisão e organização → publicação no site → distribuição nos canais
```

## O que já compõe a plataforma

| Área                      | Para que serve                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Site público**          | Catálogo de ofertas, pesquisa, categorias, cupons, favoritos, conta e comentários.                        |
| **Painel administrativo** | Gestão de ofertas e categorias, curadoria, moderação, integrações, jobs e acompanhamento das publicações. |
| **API**                   | Centraliza autenticação, regras do negócio, permissões e os dados utilizados pelos dois frontends.        |
| **Worker**                | Executa as tarefas em segundo plano: agendamentos, expiração de ofertas e entregas automáticas.           |
| **Bridge WhatsApp**       | Serviço isolado e opcional para integrar o canal sem misturar a sessão do WhatsApp à aplicação principal. |
| **App Android**           | Aplicativo Capacitor que apresenta a mesma experiência do site público em um contêiner nativo.            |

## Como as partes se conectam

```text
                  ┌──────────────────┐
                  │  Site público    │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │ Painel da equipe │
                  └────────┬─────────┘
                           │ HTTPS
                    ┌──────▼──────┐
                    │  API Promimi │
                    └──┬───────┬──┘
                       │       │
             ┌─────────▼──┐ ┌──▼─────────────┐
             │ PostgreSQL │ │ Worker / fila  │
             └────────────┘ └──┬─────────────┘
                                │
                   ┌────────────▼───────────┐
                   │ Canais e integrações   │
                   │ (incluindo WhatsApp)   │
                   └────────────────────────┘
```

O projeto é um **monólito modular**. Isso significa que a plataforma pode ser desenvolvida e implantada como um produto único, mas seu código é separado por responsabilidade. Catálogo, identidade, comunidade, analytics, automação, publicação e integrações não ficam misturados entre si. É uma estrutura prática para evoluir rápido hoje e manter o caminho aberto para separar algum serviço no futuro, se isso passar a fazer sentido.

## Organização do repositório

```text
apps/
  site/       experiência para quem procura promoções
  admin/      painel de operação e moderação
  api/        regras do produto e endpoints
  worker/     tarefas assíncronas e automações
  whatsapp/   integração opcional, isolada
  mobile/     aplicativo Android Capacitor

packages/
  design-system/  marca e componentes visuais compartilhados
  query/          configuração compartilhada de dados e cache no frontend
  database/       acesso ao banco, esquema e migrações
  config/         convenções técnicas compartilhadas

infra/        contêineres, proxy, banco e monitoramento
docs/         decisões, arquitetura, operação e segurança
```

## Experiência e segurança

- Sessões são mantidas em cookies `HttpOnly`, em vez de tokens acessíveis pelo JavaScript do navegador.
- A API aplica proteção contra CSRF, limitação de requisições, validação de entradas e cabeçalhos de segurança.
- Os serviços que atendem o público ficam atrás de um proxy HTTPS; banco de dados e comunicação interna não são expostos diretamente.
- A integração com WhatsApp vive em processo separado para reduzir o impacto de falhas e facilitar sua operação.
- O deploy publica imagens imutáveis apenas dos serviços afetados pela alteração; documentação não aciona produção.

Os detalhes técnicos e as decisões que sustentam essas escolhas estão em [docs/architecture.md](docs/architecture.md), [docs/security.md](docs/security.md) e [docs/operations.md](docs/operations.md).

## Rodando localmente

### Pré-requisitos

- Node.js 22 ou superior
- pnpm 11 ou superior
- Docker e Docker Compose

### Primeiros passos

```bash
git clone https://github.com/ferforastieri/promimi.git
cd promimi
cp .env.example .env
pnpm install
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

O comando `pnpm dev` inicia os aplicativos de desenvolvimento. Configure os valores do arquivo `.env` conforme o ambiente local. O `.env` nunca deve ser versionado.

### Conferindo uma mudança

```bash
pnpm verify
```

Esse comando verifica o banco, os tipos, os testes e os builds de todos os aplicativos antes de uma alteração seguir para produção.

## Publicação

Cada envio para `main` identifica os aplicativos afetados. Alterações de documentação terminam após essa análise; alterações de código validam apenas os pacotes relacionados, criam somente as imagens necessárias e atualizam somente os serviços correspondentes no servidor.

Quando o site ou o app móvel mudar, o workflow também pode gerar um APK Android. Para isso, cadastre a variável pública `MOBILE_SITE_URL` no repositório do GitHub com a URL HTTPS do site. O artefato fica disponível na execução do GitHub Actions; a assinatura e o envio para a Play Store permanecem uma etapa separada. Informações operacionais estão em [infra/OPERATIONS.md](infra/OPERATIONS.md).

## Documentação

- [Visão de arquitetura](docs/architecture.md)
- [Operação e deploy](docs/operations.md)
- [Segurança](docs/security.md)
- [Decisões de arquitetura](docs/adr/)

## Licença

Este projeto está licenciado sob a [GNU Affero General Public License v3.0 ou posterior](LICENSE) (`AGPL-3.0-or-later`).
