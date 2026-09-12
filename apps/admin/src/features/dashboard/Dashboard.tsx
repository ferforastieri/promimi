import type { AdminOffer } from "../../api/features/offers/list-offers";
import type { AdminStatistics } from "../../api/features/analytics/get-statistics";
import { OfferTable } from "../offers/OfferTable";

export function Dashboard({ offers, statistics, onNewOffer }: { offers: AdminOffer[]; statistics: AdminStatistics; onNewOffer: () => void }) {
  const metrics = [[statistics.activeOffers, "Ofertas ativas"], [statistics.rawClicks24h, "Cliques brutos nas últimas 24h"], [statistics.clicks24h, "Cliques filtrados nas últimas 24h"], [statistics.visibleComments, "Comentários visíveis"]] as const;
  return <><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map(([value, label]) => <section className="rounded-2xl border border-line bg-white p-5" key={label}><p className="mb-3 text-sm text-ink/55">{label}</p><strong className="block text-3xl font-bold tracking-tight">{value}</strong></section>)}</div><section className="mt-4 overflow-hidden rounded-2xl border border-line bg-white"><div className="flex items-start justify-between border-b border-line px-5 py-5"><div><p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">OFERTAS</p><h2 className="text-lg font-bold tracking-tight">Publicadas recentemente</h2></div><button className="text-sm font-bold text-brand hover:text-brand-dark" onClick={onNewOffer}>+ Cadastrar</button></div><OfferTable offers={offers} /></section></>;
}
