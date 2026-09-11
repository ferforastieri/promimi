export type OfferStatus = "DRAFT" | "PUBLISHED" | "EXPIRED" | "PAUSED";

export function calculateDiscount(currentPrice: number, originalPrice?: number | null) {
  if (!originalPrice || originalPrice <= currentPrice) return null;
  return Math.round((1 - currentPrice / originalPrice) * 100);
}

export function shouldRequestPublication(status: OfferStatus) {
  return status === "PUBLISHED";
}
