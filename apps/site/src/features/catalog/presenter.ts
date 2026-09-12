import type { CommerceOfferCardProps } from "@promimi/design-system";
import type { Offer } from "./types";
import { brl } from "./server";

const tones: Record<string, CommerceOfferCardProps["tone"]> = {
  casa: "warm",
  esporte: "green",
  tecnologia: "blue",
  audio: "violet",
};

/** Converts catalog data into neutral visual props without leaking API types into the design system. */
export const toCommerceOfferCardProps = (offer: Offer): CommerceOfferCardProps => ({
  href: `/oferta/${offer.slug}`,
  category: offer.category?.name ?? "Oferta",
  store: offer.store.name,
  title: offer.title,
  price: brl(offer.currentPrice),
  originalPrice: offer.originalPrice ? brl(offer.originalPrice) : undefined,
  discount: offer.discountPercent ? `${offer.discountPercent}%` : undefined,
  coupon: offer.couponCode ?? undefined,
  tone: tones[offer.category?.slug ?? ""] ?? "blue",
});
