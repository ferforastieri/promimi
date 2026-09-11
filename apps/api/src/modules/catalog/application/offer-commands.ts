import type { OfferStatus } from "../domain/offer-policy.js";

export type OfferInput = {
  title: string;
  description?: string;
  storeId: string;
  categoryId?: string | null;
  currentPrice: number;
  originalPrice?: number | null;
  couponCode?: string | null;
  affiliateUrl: string;
  imageUrl?: string | null;
  expiresAt?: Date | null;
  status?: OfferStatus;
};

export type CreateOfferCommand = OfferInput & { createdById: string };
export type UpdateOfferCommand = Partial<OfferInput>;
