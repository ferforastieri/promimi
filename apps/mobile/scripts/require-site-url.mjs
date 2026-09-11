if (!process.env.PROMIMI_MOBILE_SITE_URL?.startsWith("https://")) {
  throw new Error(
    "PROMIMI_MOBILE_SITE_URL precisa ser uma URL HTTPS pública para gerar o release Android.",
  );
}
