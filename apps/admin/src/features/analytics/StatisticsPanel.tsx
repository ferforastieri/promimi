import { useStatistics } from "./hooks";
export function StatisticsPanel() {
  const statistics = useStatistics();
  const stats = statistics.data?.data;
  return (
    <section className="rounded-2xl border border-line bg-white p-6"><p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">MÉTRICAS</p><h2 className="text-xl font-bold tracking-tight">Estatísticas de clique</h2>
      {statistics.error && (
        <p className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {statistics.error instanceof Error
            ? statistics.error.message
            : "Não foi possível carregar estatísticas."}
        </p>
      )}
      {stats && (
        <>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
            [stats.activeOffers, "ofertas ativas"], [stats.rawClicks24h, "cliques brutos / 24h"], [stats.clicks24h, "cliques filtrados / 24h"], [stats.visibleComments, "comentários visíveis"]
          ].map(([value, label]) => <strong key={String(label)} className="grid gap-1 rounded-xl bg-mist p-4 text-2xl tracking-tight">{value}<small className="text-[10px] font-semibold text-ink/50">{label}</small></strong>)}</div>{/*
            <strong>
              {stats.activeOffers}
              <small>ofertas ativas</small>
            </strong>
            <strong>
              {stats.rawClicks24h}
              <small>cliques brutos / 24h</small>
            </strong>
            <strong>
              {stats.clicks24h}
              <small>cliques filtrados / 24h</small>
            </strong>
            <strong>
              {stats.visibleComments}
              <small>comentários visíveis</small>
            </strong>
          </div> */}<div className="mt-5 grid gap-2">
            {stats.clicksBySource.map((item) => (
              <article className="flex items-center justify-between rounded-xl border border-line p-4" key={item.source}><strong className="text-sm">{item.source}</strong><small className="text-xs text-ink/50">
                  {item.clicks} cliques filtrados nos últimos 30 dias
                </small>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
