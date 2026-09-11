export * from "./api.js";
export * from "./commands.js";
export * from "./events.js";
import type { OfferStatus } from "./api.js";

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
}

export interface Offer {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  store: Store;
  currentPrice: number;
  originalPrice?: number | null;
  discountPercent?: number | null;
  couponCode?: string | null;
  affiliateUrl: string;
  status: OfferStatus;
  verifiedAt?: string | null;
  expiresAt?: string | null;
  publishedAt?: string | null;
  category?: { name: string; slug: string } | null;
}

export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const brasiliaDate = (date: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo"
  }).format(new Date(date));
