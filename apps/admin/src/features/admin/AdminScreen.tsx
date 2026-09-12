import { useState } from "react";
import {
  AppFrame,
  BrandMark,
  Button,
  IconButton,
  LoadingCard,
  NavigationItem,
  NotFoundPage,
  PageLayout,
  Skeleton,
  StatusPill,
  TableSkeleton,
  TextButton,
} from "@promimi/design-system";
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
const tabs: Array<{ label: Tab; icon: string }> = [
  { label: "Visão geral", icon: "▦" },
  { label: "Ofertas", icon: "◇" },
  { label: "Categorias", icon: "▤" },
  { label: "Comentários", icon: "◌" },
  { label: "Usuários", icon: "♙" },
  { label: "Rotinas", icon: "↻" },
  { label: "Integrações", icon: "⌁" },
  { label: "Publicações", icon: "◉" },
  { label: "Estatísticas", icon: "↗" },
];

function AdminNavigation({
  tab,
  onChange,
}: {
  tab: Tab;
  onChange: (tab: Tab) => void;
}) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto px-4 py-3 lg:grid lg:gap-1 lg:px-3 lg:py-5"
      aria-label="Navegação do painel"
    >
      {tabs.map((item) => (
        <NavigationItem
          key={item.label}
          active={tab === item.label}
          icon={item.icon}
          onClick={() => onChange(item.label)}
        >
          {item.label}
        </NavigationItem>
      ))}
    </nav>
  );
}

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

  if (window.location.pathname !== "/")
    return (
      <NotFoundPage
        homeHref="/"
        homeLabel="Abrir painel"
        title="Área não encontrada"
        description="Esta área do painel não existe."
      />
    );
  if (session.isLoading)
    return (
      <main className="grid min-h-screen grid-cols-[15.25rem_1fr] bg-mist p-3">
        <Skeleton className="rounded-[28px]" />
        <div className="ml-3 grid gap-5">
          <Skeleton className="h-[74px] rounded-[28px]" />
          <div className="grid grid-cols-4 gap-3">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
          <LoadingCard className="h-80" />
        </div>
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
    <AppFrame className="p-0 lg:p-3">
      <div className="min-h-screen bg-mist lg:grid lg:min-h-[calc(100vh-1.5rem)] lg:grid-cols-[15.25rem_1fr] lg:overflow-hidden lg:rounded-[28px] lg:border lg:border-line lg:bg-white lg:shadow-[0_16px_48px_rgba(29,36,50,.06)]">
        <aside className="border-b border-line bg-white lg:flex lg:min-h-0 lg:flex-col lg:border-b-0 lg:border-r">
          <a
            className="mx-4 mt-4 inline-flex w-max items-center gap-2.5 rounded-2xl bg-mist px-3.5 py-2.5 text-[22px] font-semibold tracking-[-.08em] lg:mx-5 lg:mt-5"
            href="#inicio"
          >
            <BrandMark className="h-8 w-8" label="" />
            <span>
              pro<b>mimi</b>
              <i className="not-italic text-brand">•</i>
            </span>
          </a>
          <AdminNavigation tab={tab} onChange={setTab} />
          <div className="hidden border-t border-line p-4 lg:mt-auto lg:block">
            <div className="flex items-center gap-2.5 rounded-xl p-2">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                {session.data?.data.email.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-xs">
                  {session.data?.data.name ?? session.data?.data.email}
                </strong>
                <span className="mt-0.5 block text-[11px] text-ink/48">
                  Sessão protegida
                </span>
              </div>
              <TextButton
                className="text-xs"
                disabled={logout.isPending}
                onClick={() => void logoutNow()}
              >
                {logout.isPending ? "…" : "Sair"}
              </TextButton>
            </div>
          </div>
        </aside>
        <main className="min-w-0 bg-mist/80">
          <header className="flex min-h-[74px] items-center justify-between gap-3 border-b border-line bg-white/85 px-4 backdrop-blur sm:px-6 lg:px-8">
            <div>
              <p className="hidden text-[11px] font-medium text-ink/46 sm:block">
                Operação Promimi
              </p>
              <h1 className="text-lg font-semibold tracking-[-.025em] sm:text-xl">
                {tab}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <StatusPill tone="green">
                <span className="hidden sm:inline">Sistema </span>online
              </StatusPill>
              <IconButton
                label="Atualizar dados"
                disabled={
                  offers.isFetching ||
                  statistics.isFetching ||
                  formOptions.isFetching
                }
                onClick={() => void refresh()}
              >
                ↻
              </IconButton>
              <Button
                onClick={() => setModal(true)}
                leading={<span className="text-base leading-none">+</span>}
                className="hidden sm:inline-flex"
              >
                Nova oferta
              </Button>
              <Button onClick={() => setModal(true)} className="sm:hidden">
                + Nova
              </Button>
            </div>
          </header>
          <PageLayout
            as="section"
            width="fluid"
            className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7"
          >
            {(offers.error || statistics.error) && (
              <div className="mb-5 rounded-xl border border-danger/15 bg-danger-soft px-4 py-3 text-sm text-danger">
                {offers.error instanceof Error
                  ? offers.error.message
                  : statistics.error instanceof Error
                    ? statistics.error.message
                    : "Falha ao atualizar o painel."}
              </div>
            )}
            {(offers.isLoading || statistics.isLoading) &&
            (tab === "Visão geral" || tab === "Ofertas") ? (
              <div className="grid gap-4">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                  <LoadingCard />
                </div>
                <TableSkeleton rows={6} columns={5} />
              </div>
            ) : tab === "Visão geral" || tab === "Ofertas" ? (
              <Dashboard
                offers={data}
                statistics={stats!}
                onNewOffer={() => setModal(true)}
              />
            ) : (
              management
            )}
          </PageLayout>
        </main>
        <OfferForm
          open={modal}
          loading={formOptions.isLoading}
          stores={formOptions.data?.stores ?? []}
          categories={formOptions.data?.categories ?? []}
          onCancel={() => setModal(false)}
          onSaved={() => setModal(false)}
        />
      </div>
    </AppFrame>
  );
}
