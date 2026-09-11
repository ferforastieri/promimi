# ADR 004 — Entrega imutável

GitHub Actions valida, constrói imagens versionadas no GHCR e aciona o deploy no VPS. O host não compila a aplicação: apenas recebe compose, migrações e referências de imagens. Caddy termina TLS e só expõe as aplicações públicas.
