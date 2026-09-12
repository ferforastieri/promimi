import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Icon,
  IconButton,
  NotFoundPage,
  PageLayout,
  StatusPill,
  WorkspaceLoading,
  WorkspaceShell,
  type WorkspaceNavigationItem,
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
const tabs: Array<WorkspaceNavigationItem & { id: Tab }> = [
  { id: "Visão geral", label: "Visão geral", icon: "grid" },
  { id: "Ofertas", label: "Ofertas", icon: "tag" },
  { id: "Categorias", label: "Categorias", icon: "folder" },
  { id: "Comentários", label: "Comentários", icon: "chat" },
  { id: "Usuários", label: "Usuários", icon: "users" },
  { id: "Rotinas", label: "Rotinas", icon: "refresh" },
  { id: "Integrações", label: "Integrações", icon: "link" },
  { id: "Publicações", label: "Publicações", icon: "send" },
  { id: "Estatísticas", label: "Estatísticas", icon: "chart" },
];

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
  if (session.isLoading) return <WorkspaceLoading />;
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
    <WorkspaceShell
      items={tabs}
      activeItem={tab}
      onNavigate={(id) => setTab(id as Tab)}
      toolbar={
        <>
          <StatusPill tone="green">Ao vivo</StatusPill>
          <Button variant="subtle" size="sm" leading={<Icon name="calendar" />}>Hoje</Button>
          <IconButton label="Atualizar dados" disabled={offers.isFetching || statistics.isFetching || formOptions.isFetching} onClick={() => void refresh()}><Icon name="refresh" /></IconButton>
          <Button onClick={() => setModal(true)} size="sm" leading={<Icon name="plus" />}>Nova oferta</Button>
          <Avatar name={session.data?.data.name ?? session.data?.data.email ?? "Admin"} size="sm" />
          <Button variant="ghost" size="sm" disabled={logout.isPending} onClick={() => void logoutNow()}>{logout.isPending ? "Saindo…" : "Sair"}</Button>
        </>
      }
    >
      <PageLayout as="section" width="fluid">
            {(offers.error || statistics.error) && (
              <Alert className="mb-5" tone="error" title="Falha ao atualizar o painel">
                {offers.error instanceof Error
                  ? offers.error.message
                  : statistics.error instanceof Error
                    ? statistics.error.message
                    : "Falha ao atualizar o painel."}
              </Alert>
            )}
            {(offers.isLoading || statistics.isLoading) &&
            (tab === "Visão geral" || tab === "Ofertas") ? (
              <WorkspaceLoading />
            ) : tab === "Visão geral" || tab === "Ofertas" ? (
              <Dashboard offers={data} statistics={stats!} onNewOffer={() => setModal(true)} />
            ) : (
              management
            )}
      </PageLayout>
      <OfferForm
          open={modal}
          loading={formOptions.isLoading}
          stores={formOptions.data?.stores ?? []}
          categories={formOptions.data?.categories ?? []}
          onCancel={() => setModal(false)}
          onSaved={() => setModal(false)}
      />
    </WorkspaceShell>
  );
}
