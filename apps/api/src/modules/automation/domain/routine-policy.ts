export const isFiveFieldCron = (value: string) =>
  /^(\S+\s+){4}\S+$/.test(value);
export const supportedDestinations = new Set([
  "telegram",
  "whatsapp",
  "instagram",
  "facebook",
  "x",
]);
