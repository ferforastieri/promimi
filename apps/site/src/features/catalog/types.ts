export type OfferStatus = "DRAFT" | "PUBLISHED" | "EXPIRED" | "PAUSED";

export type Store = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
};

/** Public catalog response model. It deliberately excludes administrative and persistence fields. */
export type Offer = {
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
};
