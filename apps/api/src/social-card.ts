type SocialCardOffer = { title: string; currentPrice: string | number; originalPrice?: string | number | null; discountPercent?: number | null; couponCode?: string | null; store: { name: string } };

const escapeXml = (value: string) => value.replace(/[<>&'\"]/g, (character) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", "\"": "&quot;" })[character] ?? character);
const brl = (price: string | number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(price));

/** Deterministic 1200×630 SVG card: no paid image generation or remote asset needed. */
export function socialCardSvg(offer: SocialCardOffer) {
  const title = escapeXml(offer.title.length > 68 ? `${offer.title.slice(0, 65)}…` : offer.title);
  const store = escapeXml(offer.store.name);
  const coupon = offer.couponCode ? `CUPOM ${escapeXml(offer.couponCode)}` : "OFERTA VERIFICADA";
  const discount = offer.discountPercent ? `${offer.discountPercent}% OFF` : "PROMIMI";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${title}">
<rect width="1200" height="630" fill="#f8f6ef"/><path d="M0 0h1200v92H0z" fill="#22292e"/><circle cx="1070" cy="500" r="220" fill="#ff6b24" opacity=".14"/><circle cx="1010" cy="460" r="132" fill="#2b9f76" opacity=".14"/>
<text x="72" y="59" fill="#fff" font-family="Arial,sans-serif" font-size="34" font-weight="700">pro<tspan fill="#fff">mimi</tspan><tspan fill="#ff6b24">•</tspan></text><text x="1010" y="59" fill="#ffbd88" font-family="Arial,sans-serif" font-size="22" font-weight="700">${discount}</text>
<rect x="72" y="158" width="170" height="40" rx="20" fill="#dff5e9"/><text x="94" y="185" fill="#08704a" font-family="Arial,sans-serif" font-size="18" font-weight="700">${store}</text>
<text x="72" y="270" fill="#252c2e" font-family="Georgia,serif" font-size="52" font-weight="700">${title}</text><text x="72" y="372" fill="#ff5e16" font-family="Arial,sans-serif" font-size="72" font-weight="800">${brl(offer.currentPrice)}</text>
${offer.originalPrice ? `<text x="76" y="414" fill="#747c7b" font-family="Arial,sans-serif" font-size="24">de ${brl(offer.originalPrice)}</text>` : ""}<rect x="72" y="470" width="310" height="58" rx="10" fill="#22292e"/><text x="96" y="507" fill="#fff" font-family="Arial,sans-serif" font-size="22" font-weight="700">${coupon}</text>
<text x="72" y="580" fill="#747c7b" font-family="Arial,sans-serif" font-size="18">Preço conferido pela equipe • alguns links podem render comissão</text></svg>`;
}
