export type OfferStatus = "DRAFT" | "PUBLISHED" | "EXPIRED" | "PAUSED";
export type UserRole = "ADMIN" | "EDITOR" | "VISITOR";

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

export interface ApiList<T> { data: T[]; total: number; }
export interface ApiError { error: string; message: string; }

export const money = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

export const brasiliaDate = (date: string | Date) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo"
  }).format(new Date(date));
