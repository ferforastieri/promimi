# App Android

O aplicativo Android usa Capacitor e abre a mesma interface pública do Promimi. O endereço é fornecido no momento do build por `PROMIMI_MOBILE_SITE_URL`, sempre como URL HTTPS pública.

```bash
PROMIMI_MOBILE_SITE_URL=https://promimi.exemplo.com \
  pnpm --filter @promimi/mobile android:debug
```

O APK de release é criado pelo GitHub Actions quando a variável pública `MOBILE_SITE_URL` estiver cadastrada no repositório. O arquivo gerado é um artefato de teste; assinatura de produção e publicação na Play Store são feitas em etapa própria.
