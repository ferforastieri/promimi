import { Link } from "react-router";
import { Footer, Header, OfferCard } from "../components";
import { apiOffers, brl } from "../lib";
import { OfferActions } from "../offer-actions";

export async function loader({ params }: { params: { slug: string } }) {
  const offers = await apiOffers();
  return { offer: offers.find((offer) => offer.slug === params.slug) ?? offers[0], related: offers.slice(1, 4) };
}
export function meta({ data }: { data: Awaited<ReturnType<typeof loader>> }) { const offer = data?.offer; if (!offer) return [{ title: "Oferta — Promimi" }]; const origin = process.env.APP_URL ?? "http://localhost:3000"; return [{ title: `${offer.title} — Promimi` }, { name: "description", content: `${offer.title} por ${brl(offer.currentPrice)} na ${offer.store.name}.` }, { property: "og:title", content: offer.title }, { property: "og:description", content: `Oferta verificada na ${offer.store.name}.` }, { property: "og:type", content: "product" }, { property: "og:url", content: `${origin}/oferta/${offer.slug}` }]; }

export default function Offer({ loaderData }: { loaderData: Awaited<ReturnType<typeof loader>> }) {
  const { offer, related } = loaderData;
  if (!offer) return null;
  const trackedUrl = `${process.env.API_URL ?? "http://localhost:3001"}/api/v1/offers/${offer.id}/go?source=site`;
  return <><Header/><main className="offer-page"><Link className="back" to="/buscar">← Voltar às ofertas</Link><div className="offer-detail"><div className={`detail-visual visual-${offer.category?.slug ?? "geral"}`}><span>{offer.category?.name}</span><div className="product-orb"/></div><div className="detail-copy"><p className="eyebrow">{offer.store.name.toUpperCase()} <span>•</span> VERIFICADA AGORA</p><h1>{offer.title}</h1><div className="detail-prices">{offer.originalPrice && <del>de {brl(offer.originalPrice)}</del>}<strong>{brl(offer.currentPrice)}</strong>{offer.discountPercent && <b>economize {offer.discountPercent}%</b>}</div>{offer.couponCode && <div className="coupon large"><small>USE O CUPOM</small><code>{offer.couponCode}</code><button onClick={() => navigator.clipboard?.writeText(offer.couponCode ?? "")}>Copiar</button></div>}<a className="buy-button" href={trackedUrl} target="_blank" rel="noreferrer">Ir para a loja <span>↗</span></a><p className="safe-note">Você será direcionado para {offer.store.name}. Podemos receber comissão por esta compra.</p><div className="detail-actions"><button onClick={() => navigator.share?.({ title: offer.title, url: window.location.href })}>↗ Compartilhar</button></div></div></div><section className="description"><p className="section-label">SOBRE ESTA OFERTA</p><h2>Vale a pena?</h2><p>{offer.description ?? "Preço encontrado pela equipe Promimi e conferido antes da publicação. Estoque, frete e condições podem variar conforme o seu CEP."}</p><p>Última verificação em horário de Brasília. Caso o preço tenha mudado, avise nossa equipe.</p></section><OfferActions offerId={offer.id}/><section className="latest"><div className="section-heading"><div><p className="section-label">VOCÊ TAMBÉM PODE GOSTAR</p><h2>Continue garimpando</h2></div></div><div className="offer-grid">{related.map((item) => <OfferCard key={item.id} offer={item}/>)}</div></section></main><Footer/></>;
}
