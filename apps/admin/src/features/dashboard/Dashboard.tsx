import type { AdminOffer } from "../../api/features/offers/list-offers";
import type { AdminStatistics } from "../../api/features/analytics/get-statistics";
import { OfferTable } from "../offers/OfferTable";

export function Dashboard({
  offers,
  statistics,
  onNewOffer,
}: {
  offers: AdminOffer[];
  statistics: AdminStatistics;
  onNewOffer: () => void;
}) {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          value={String(statistics.activeOffers)}
          label="Ofertas ativas"
          trend="no catálogo"
        />
        <Metric
          value={String(statistics.clicks24h)}
          label="Cliques nas últimas 24h"
          trend="tráfego bruto"
        />
        <Metric
          value="—"
          label="Taxa de clique"
          trend="após origem configurada"
        />
        <Metric
          value={String(statistics.visibleComments)}
          label="Comentários visíveis"
          trend="moderar no painel"
          warn
        />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-start justify-between border-b border-line px-5 py-5">
            <div>
              <p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">OFERTAS</p>
              <h2 className="text-lg font-bold tracking-tight">Publicadas recentemente</h2>
            </div>
            <button className="text-sm font-bold text-brand hover:text-brand-dark" onClick={onNewOffer}>+ Cadastrar</button>
          </div>
          <OfferTable offers={offers} />
        </section>
        <section className="self-start overflow-hidden rounded-2xl border border-line bg-white">
          <div className="flex items-start justify-between border-b border-line px-5 py-5">
            <div>
              <p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">PUBLICAÇÕES</p>
              <h2 className="text-lg font-bold tracking-tight">Fila de distribuição</h2>
            </div>
            <span className="text-[10px] font-bold text-pine">● Worker agenda a cada 2 min</span>
          </div>
          {["Telegram", "WhatsApp", "Instagram", "Facebook"].map(
            (name, index) => (
              <div className="flex items-center gap-3 border-b border-line/70 px-5 py-4" key={name}>
                <i
                  style={{
                    background: ["#2b9f76", "#2b9f76", "#bd5c85", "#477cc4"][
                      index
                    ],
                  }}
                />
                <div className="grid gap-0.5">
                  <strong className="text-sm">{name}</strong>
                  <small className="text-xs text-ink/50">Configure em Integrações para ativar</small>
                </div>
              </div>
            ),
          )}
          <a className="block px-5 py-4 text-sm font-bold text-brand hover:text-brand-dark" href="#integracoes">
            Gerenciar destinos →
          </a>
        </section>
      </div>
    </>
  );
}
function Metric({
  value,
  label,
  trend,
  warn,
}: {
  value: string;
  label: string;
  trend: string;
  warn?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5">
      <p className="mb-3 text-sm text-ink/55">{label}</p>
      <strong className="mb-2 block text-3xl font-bold tracking-tight">{value}</strong>
      <small className={`text-xs font-bold ${warn ? "text-danger" : "text-pine"}`}>
        {warn ? "● " : "↗ "}
        {trend}
      </small>
    </section>
  );
}
