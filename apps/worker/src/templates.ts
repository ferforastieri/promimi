export type PublicationOffer = {
  id: string;
  title: string;
  slug: string;
  currentPrice: string;
  originalPrice: string | null;
  discountPercent: number | null;
  couponCode: string | null;
  affiliateUrl: string;
  store: { name: string };
};

export const brl = (price: string) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    Number(price),
  );

/** Templates stay deterministic: no paid AI, no unreviewable generated copy. */
export function publicationText(offer: PublicationOffer, destination: string) {
  const discount = offer.discountPercent
    ? ` 🔥 ${offer.discountPercent}% OFF`
    : "";
  const coupon = offer.couponCode ? `\nCupom: ${offer.couponCode}` : "";
  const disclosure =
    destination === "instagram" ? " Use o código/link da bio." : "";
  return `Achado Promimi${discount}\n${offer.title}\nAgora por ${brl(offer.currentPrice)} na ${offer.store.name}.${coupon}\n${offer.affiliateUrl}${disclosure}\n\nPreço conferido pela equipe. Alguns links podem render comissão.`;
}

export function publicationCard(offer: PublicationOffer) {
  return {
    title: offer.title,
    price: brl(offer.currentPrice),
    previousPrice: offer.originalPrice ? brl(offer.originalPrice) : null,
    discount: offer.discountPercent,
    coupon: offer.couponCode,
    store: offer.store.name,
    slug: offer.slug,
  };
}
