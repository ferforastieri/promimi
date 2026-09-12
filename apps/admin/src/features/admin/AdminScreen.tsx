import { useState } from "react";
import { AppFrame, BrandMark, Button, NotFoundPage, PageLayout } from "@promimi/design-system";
import { Dashboard } from "../dashboard/Dashboard";
import { LoginScreen } from "../auth/LoginScreen";
import { useCurrentSession, useLogout } from "../auth/hooks";
import { useOffers, useOfferFormOptions } from "../offers/hooks";
import { OfferForm } from "../offers/OfferForm";
import { useStatistics } from "../analytics/hooks";
import { CommentPanel } from "../community/CommentPanel";
import { CategoryPanel } from "../categories/CategoryPanel";
import { UserPanel } from "../users/UserPanel";
import { RoutinePanel } from "../automation/RoutinePanel";
import { IntegrationPanel } from "../integrations/IntegrationPanel";
import { PublicationPanel } from "../publishing/PublicationPanel";
import { StatisticsPanel } from "../analytics/StatisticsPanel";

type Tab =
  | "Visão geral"
  | "Ofertas"
  | "Categorias"
  | "Comentários"
  | "Usuários"
  | "Rotinas"
  | "Integrações"
  | "Publicações"
  | "Estatísticas";
const tabs: Tab[] = [
  "Visão geral",
  "Ofertas",
  "Categorias",
  "Comentários",
  "Usuários",
  "Rotinas",
  "Integrações",
  "Publicações",
  "Estatísticas",
];
const icons = ["▦", "◇", "⊞", "▤", "♙", "↻", "⌁", "◌", "↗"];

export function AdminScreen() {
  const [tab, setTab] = useState<Tab>("Visão geral");
  const [modal, setModal] = useState(false);
  const session = useCurrentSession();
  const offers = useOffers();
  const statistics = useStatistics();
  const formOptions = useOfferFormOptions();
  const logout = useLogout();
  const isStaff =
    session.data?.data.role === "ADMIN" || session.data?.data.role === "EDITOR";

  if (window.location.pathname !== "/") return <NotFoundPage homeHref="/" homeLabel="Abrir painel" title="Área não encontrada" description="Esta área do painel não existe." />;
  if (session.isLoading)
    return (
      <main className="grid min-h-screen place-items-center bg-mist text-sm text-ink/60">
        <p>Verificando sessão segura…</p>
      </main>
    );
  if (!isStaff) return <LoginScreen />;

  const refresh = () =>
    Promise.all([
      offers.refetch(),
      statistics.refetch(),
      formOptions.refetch(),
    ]);
  const logoutNow = async () => {
    await logout.mutateAsync();
    setTab("Visão geral");
  };
  const data = offers.data?.data ?? [];
  const stats = statistics.data?.data;
  const management =
    tab === "Integrações" ? (
      <IntegrationPanel />
    ) : tab === "Rotinas" ? (
      <RoutinePanel />
    ) : tab === "Categorias" ? (
      <CategoryPanel />
    ) : tab === "Usuários" ? (
      <UserPanel />
    ) : tab === "Publicações" ? (
      <PublicationPanel />
    ) : tab === "Estatísticas" ? (
      <StatisticsPanel />
    ) : (
      <CommentPanel />
    );

  return (
    <AppFrame className="lg:grid lg:grid-cols-[15rem_1fr]">
      <aside className="flex border-b border-white/10 bg-[#22292e] px-4 py-4 text-slate-100 lg:min-h-screen lg:flex-col lg:border-b-0 lg:px-4 lg:py-8">
        <a className="px-2 text-2xl tracking-[-.12em] text-white" href="#inicio">
          <BrandMark className="h-7 w-7" label="" /><span className="font-normal">pro</span><b>mimi</b><i className="not-italic text-brand">•</i><small className="ml-3 font-mono text-[9px] tracking-[.16em] text-slate-400">PAINEL</small>
        </a>
        <nav className="ml-auto flex gap-1 overflow-x-auto lg:ml-0 lg:mt-12 lg:grid">
          {tabs.map((item, index) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${tab === item ? "bg-white/12 text-white" : "text-slate-400 hover:bg-white/8 hover:text-white"}`}
            >
              <span>{icons[index]}</span>
              {item}
            </button>
          ))}
        </nav>
        <div className="hidden items-center gap-2 border-t border-white/10 px-2 pt-4 lg:mt-auto lg:flex">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-200 text-[10px] font-bold text-ink">{session.data?.data.email.slice(0, 1).toUpperCase()}</span>
          <div className="grid text-xs"><strong>{session.data?.data.name ?? session.data?.data.email}</strong><small className="text-[10px] text-slate-400">Sessão protegida</small>
          </div>
          <button className="ml-auto text-xs text-slate-400 hover:text-white disabled:opacity-50" disabled={logout.isPending} onClick={() => void logoutNow()}>
            Sair
          </button>
        </div>
      </aside>
      <PageLayout as="section" width="fluid" className="px-4 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{tab}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink/60 transition hover:border-brand/40 disabled:cursor-wait disabled:opacity-50" disabled={offers.isFetching || statistics.isFetching || formOptions.isFetching} onClick={() => void refresh()}>
              ↻
            </button>
            <Button onClick={() => setModal(true)}>+ Nova oferta</Button>
          </div>
        </header>
        {(offers.error || statistics.error) && (
          <div className="mb-5 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger">
            {offers.error instanceof Error
              ? offers.error.message
              : statistics.error instanceof Error
                ? statistics.error.message
                : "Falha ao atualizar o painel."}
          </div>
        )}
        {(offers.isLoading || statistics.isLoading) && (tab === "Visão geral" || tab === "Ofertas") ? <p className="text-sm text-ink/60">Carregando dados…</p> : tab === "Visão geral" || tab === "Ofertas" ? (
          <Dashboard
            offers={data}
            statistics={stats!}
            onNewOffer={() => setModal(true)}
          />
        ) : (
          management
        )}
      </PageLayout>
      {modal && (
        <OfferForm
          stores={formOptions.data?.stores ?? []}
          categories={formOptions.data?.categories ?? []}
          onCancel={() => setModal(false)}
          onSaved={() => setModal(false)}
        />
      )}
    </AppFrame>
  );
}
