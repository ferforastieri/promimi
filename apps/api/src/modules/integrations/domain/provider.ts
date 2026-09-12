export const providers = [
  "amazon",
  "mercado-livre",
  "shopee",
  "smtp",
  "telegram",
  "whatsapp",
  "instagram",
  "facebook",
  "x",
] as const;
export const isPublishingProvider = (provider: string) =>
  ["telegram", "whatsapp", "instagram", "facebook", "x"].includes(provider);
