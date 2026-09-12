import { Link } from "react-router";
import { PageLayout } from "@promimi/design-system";
import { Footer, Header, OfferCard } from "../../shell/components";
import { apiOffers } from "../server";

export const meta = () => [{ title: "Promimi — promoções que valem a pena" }, { name: "description", content: "Ofertas verificadas, cupons e preços em reais." }];
export async function loader() { return { offers: await apiOffers() }; }

export default function Home({ loaderData }: { loaderData: { offers: Awaited<ReturnType<typeof apiOffers>> } }) {
  const offers = loaderData.offers;
  return <><Header /><PageLayout className="py-12 sm:py-16"><section><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-3 font-mono text-[10px] tracking-[.1em] text-ink/70">OFERTAS VERIFICADAS</p><h1 className="font-display text-[clamp(42px,5vw,62px)] font-bold leading-[.98] tracking-[-.065em]">Encontre a próxima<br /><em className="text-brand">boa compra.</em></h1></div><Link className="rounded-lg border border-ink px-4 py-2.5 text-sm font-bold transition hover:bg-ink hover:text-white" to="/buscar">Buscar ofertas</Link></div>{offers.length ? <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">{offers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</div> : <div className="border border-dashed border-line px-6 py-16 text-center"><h2 className="font-display text-3xl font-bold">Nenhuma oferta disponível</h2><p className="mx-auto mt-3 max-w-md leading-7 text-ink/65">Assim que uma oferta for publicada pela equipe, ela aparecerá aqui.</p></div>}</section></PageLayout><Footer /></>;
}
