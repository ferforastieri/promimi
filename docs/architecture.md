# Arquitetura do Promimi

## Decisão

O Promimi é um **monólito modular**: um produto e um banco PostgreSQL, com processos independentes para API, site, painel e trabalhos assíncronos. Não há microserviços nesta fase.

```text
Caddy (TLS, headers e roteamento)
  ├─ site público (React Router SSR)
  ├─ painel operacional (React/Vite)
  └─ API Fastify ── PostgreSQL
                       └─ worker pg-boss ── conectores de publicação
                                           └─ bridge WhatsApp opcional
```

## Limites de domínio

As mudanças novas devem pertencer a um destes domínios, e não ser adicionadas como regra solta de rota:

| Domínio      | Responsabilidade                                    |
| ------------ | --------------------------------------------------- |
| Identity     | sessão, contas, papéis, TOTP e recuperação de senha |
| Catalog      | lojas, categorias, ofertas, preço e expiração       |
| Community    | favoritos, comentários e denúncias                  |
| Automation   | rotinas, critérios, execuções e coleta              |
| Publishing   | fila, tentativas e histórico de publicação          |
| Integrations | credenciais cifradas e adaptadores externos         |
| Analytics    | cliques e métricas operacionais                     |

O diretório de destino é `apps/api/src/modules/<domínio>/`. Cada módulo expõe `http/plugin.ts`, controllers, casos de uso, regras de domínio e infraestrutura de persistência. O Fastify descobre os plugins automaticamente.

## Frontend

`apps/site` e `apps/admin` são aplicações separadas porque servem públicos diferentes. Telas não armazenam token nem montam cabeçalhos de autorização: a sessão é sempre o cookie HttpOnly.

No Admin, cada endpoint está em `src/api/features/<domínio>/<chamada>.ts`, com seus tipos de entrada e saída no próprio arquivo. Cada feature contém os hooks React Query e os componentes que os consomem em `src/features/<domínio>/`. Assim, componentes não chamam `fetch`, não conhecem URL e não mantêm uma cópia manual do cache do servidor.

`packages/query` contém somente a política compartilhada de cache e o provider React Query. As chaves, endpoints e hooks continuam na aplicação dona da tela; o Site e o Admin não acoplam suas features entre si.

## Packages compartilhados

Packages não são uma segunda camada para organizar qualquer arquivo. Eles existem somente quando o mesmo código é necessário em dois ou mais processos:

| Package     | Conteúdo permitido                                                                 |
| ----------- | ---------------------------------------------------------------------------------- |
| `config`    | schemas e carregadores de configuração de ambiente                                 |
| `database`  | schema Drizzle, conexão, seed e migrações                                           |
| `query`     | provider e política de cache React Query para os dois frontends                    |
| `design-system` | marca, tokens e componentes visuais genéricos; sem regra de domínio ou página |

Regra prática: se só a API usa uma regra de catálogo, ela fica em `apps/api/src/modules/catalog`; se só o painel usa uma tela, ela fica em `apps/admin/src/features`. Não se cria package apenas para reexportar um arquivo.

## Segurança

- Sessão do navegador: cookie `HttpOnly`, `Secure` fora de desenvolvimento, `SameSite=Lax`, vida de oito horas.
- Nenhum JWT é exposto ao JavaScript ou guardado em `localStorage`.
- CORS por allow-list, credenciais habilitadas e verificação de `Origin` para mutações autenticadas (proteção CSRF).
- Limites globais e limites mais estritos para login, cadastro, recuperação, redefinição e exclusão de conta.
- Senhas com Argon2; tokens de e-mail armazenados apenas por hash; segredos de integrações cifrados.
- Caddy aplica HSTS, `nosniff`, anti-frame, política de referência e de permissões.

## Assíncrono e confiabilidade

O worker consome filas pg-boss no mesmo PostgreSQL para rotina, expiração e publicação. Seus jobs usam portas/repositórios e conectores; o processo não incorpora regras de HTTP. A outbox transacional grava oferta, publicações e eventos na mesma transação; o relay só confirma o evento depois de enfileirá-lo.

## Operação

GitHub Actions verifica, gera imagens imutáveis, executa migrações e sobe o Compose. O servidor só aceita HTTPS através do Caddy. Segredos ficam no ambiente do servidor e nos Secrets do GitHub, nunca no repositório.

Consulte também os ADRs em [`docs/adr`](./adr), o [guia de segurança](./security.md) e o [runbook](./operations.md).
