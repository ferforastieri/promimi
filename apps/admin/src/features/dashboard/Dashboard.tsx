import type { AdminOffer } from "../../api/features/offers/list-offers";
import type { AdminStatistics } from "../../api/features/analytics/get-statistics";
import {
  Button,
  Icon,
  MetricCard,
  WorkspaceOverview,
} from "@promimi/design-system";
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
    [statistics.activeOffers, "Ofertas ativas", "brand", "tag"],
    [statistics.rawClicks24h, "Cliques em 24h", "neutral", "activity"],
    [statistics.clicks24h, "Cliques qualificados", "info", "chart"],
    [statistics.visibleComments, "Comentários visíveis", "success", "chat"],
  ] as const;
  return (
    <WorkspaceOverview
      title="Controle a operação"
      description="Acompanhe catálogo, alcance e atividade da comunidade em um só lugar."
      toolbar={
        <>
          <Button variant="subtle" size="sm" leading={<Icon name="calendar" />}>Últimas 24h</Button>
          <Button variant="secondary" size="sm" leading={<Icon name="tag" />} onClick={onNewOffer}>Cadastrar oferta</Button>
        </>
      }
      metrics={metrics.map(([value, label, tone, icon]) => <MetricCard key={label} value={value} label={label} tone={tone} icon={<Icon name={icon} />} />)}
    >
      <OfferTable offers={offers} />
    </WorkspaceOverview>
  );
}
