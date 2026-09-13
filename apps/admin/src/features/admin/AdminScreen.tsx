import { useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Icon,
  IconButton,
  NotFoundPage,
  PageLayout,
  useToast,
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
import type { SessionUser } from "../../api/types";

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
  const session = useCurrentSession();
  const user = session.data?.data;
  const isStaff = user?.role === "ADMIN" || user?.role === "EDITOR";

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
  if (!isStaff || !user) return <LoginScreen />;

  return <AuthenticatedAdmin user={user} />;
}

function AuthenticatedAdmin({ user }: { user: SessionUser }) {
  const [tab, setTab] = useState<Tab>("Visão geral");
  const [modal, setModal] = useState(false);
  const offers = useOffers();
  const statistics = useStatistics();
  const formOptions = useOfferFormOptions();
  const logout = useLogout();
  const { showToast } = useToast();

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
          <IconButton label="Notificações" onClick={() => showToast({ title: "Nenhuma notificação nova", description: "As atualizações importantes da operação aparecerão aqui." })}>
            <Icon name="bell" />
          </IconButton>
          <Avatar name={user.name ?? user.email} size="sm" />
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
