import type { AdminOffer } from "../../api/features/offers/list-offers";
import type { AdminStatistics } from "../../api/features/analytics/get-statistics";
import { Button, Card, MetricCard, PanelHeader } from "@promimi/design-system";
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
  const metrics = [
    [statistics.activeOffers, "Ofertas ativas", "brand"],
    [statistics.rawClicks24h, "Cliques brutos em 24h", "neutral"],
    [statistics.clicks24h, "Cliques filtrados em 24h", "info"],
    [statistics.visibleComments, "Comentários visíveis", "success"],
  ] as const;
  return (
    <>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <p className="text-sm text-ink/55">
          Acompanhe o catálogo, a distribuição e a atividade da comunidade.
        </p>
        <Button variant="secondary" size="sm" onClick={onNewOffer}>
          + Cadastrar oferta
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([value, label, tone]) => (
          <MetricCard key={label} value={value} label={label} tone={tone} />
        ))}
      </div>
      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-line px-5 py-5">
          <PanelHeader
            eyebrow="Catálogo"
            title="Ofertas recentes"
            description="Acompanhe e atualize as últimas ofertas cadastradas."
            action={
              <Button variant="ghost" size="sm" onClick={onNewOffer}>
                Ver todas
              </Button>
            }
          />
        </div>
        <OfferTable offers={offers} />
      </Card>
    </>
  );
}
