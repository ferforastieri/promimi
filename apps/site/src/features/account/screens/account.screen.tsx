import { Link } from "react-router";
import {
  Alert,
  Avatar,
  Button,
  Card,
  EmptyState,
  LoadingCard,
  PageLayout,
  PanelHeader,
  useToast,
} from "@promimi/design-system";
import { Footer, Header, OfferCard } from "../../shell/components";
import { useAccount, useRemoveAccount } from "../hooks";

export default function Account() {
  const account = useAccount();
  const removeAccount = useRemoveAccount();
  const { showToast } = useToast();
  const profile = account.data?.profile;
  const offers = account.data?.offers ?? [];
  const remove = async () => {
    if (
      !window.confirm(
        "Excluir sua conta e anonimizar seus dados? Esta ação não pode ser desfeita.",
      )
    )
      return;
    try {
      await removeAccount.mutateAsync();
      showToast({
        title: "Conta excluída",
        description: "Seus dados de perfil foram anonimizados.",
        tone: "success",
      });
    } catch (error) {
      showToast({
        title: "Não foi possível excluir a conta",
        description: error instanceof Error ? error.message : undefined,
        tone: "error",
      });
    }
  };
  return (
    <>
      <Header />
      <PageLayout>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-ink/42">
              Sua conta
            </p>
            <h1 className="mt-1 text-[clamp(30px,4vw,42px)] font-semibold tracking-[-.055em]">
              Seu radar, <span className="text-brand">do seu jeito.</span>
            </h1>
          </div>
          <Link className="text-sm font-semibold text-brand" to="/buscar">
            Explorar ofertas →
          </Link>
        </div>
        {account.isLoading ? (
          <div className="mt-6 grid gap-4">
            <LoadingCard className="max-w-[620px]" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <LoadingCard />
              <LoadingCard />
              <LoadingCard />
            </div>
          </div>
        ) : account.error ? (
          <Alert
            className="mt-6 max-w-[560px]"
            tone="error"
            title="Não foi possível abrir sua conta"
          >
            <span>
              {account.error instanceof Error
                ? account.error.message
                : "Tente entrar novamente."}
            </span>
            <Link className="ml-2 font-semibold underline" to="/entrar">
              Entrar ou criar conta
            </Link>
          </Alert>
        ) : (
          profile && (
            <>
              <Card className="mt-6 flex max-w-[620px] items-center gap-3.5 p-5">
                <Avatar size="lg" name={profile.name ?? profile.email} />
                <div>
                  <strong className="block text-sm font-semibold">
                    {profile.name ?? "Visitante Promimi"}
                  </strong>
                  <span className="mt-1 block text-xs text-ink/55">
                    {profile.email}
                  </span>
                  <span
                    className={`mt-2 block text-xs font-medium ${profile.emailVerifiedAt ? "text-pine" : "text-amber"}`}
                  >
                    {profile.emailVerifiedAt
                      ? "● E-mail confirmado"
                      : "● Confirme o e-mail para ativar todos os recursos"}
                  </span>
                </div>
              </Card>
              <section className="pt-10">
                <PanelHeader
                  eyebrow="Ofertas guardadas"
                  title="Seus favoritos"
                  action={
                    <Link
                      className="text-sm font-semibold text-brand"
                      to="/buscar"
                    >
                      Explorar mais →
                    </Link>
                  }
                />
                {offers.length ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {offers.map((offer) => (
                      <OfferCard key={offer.id} offer={offer} />
                    ))}
                  </div>
                ) : (
                  <div className="mt-5">
                    <EmptyState
                      title="Seu radar está livre"
                      description="Favorite uma oferta para encontrá-la aqui depois."
                      action={
                        <Link
                          className="text-sm font-semibold text-brand"
                          to="/buscar"
                        >
                          Ver ofertas
                        </Link>
                      }
                    />
                  </div>
                )}
              </section>
              <Card className="mt-10 flex max-w-[760px] flex-col items-start justify-between gap-5 p-5 sm:flex-row sm:items-end">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-ink/42">
                    Privacidade
                  </p>
                  <h2 className="mt-1 text-xl font-semibold tracking-[-.035em]">
                    Excluir minha conta
                  </h2>
                  <p className="mt-2 max-w-[490px] text-sm leading-6 text-ink/55">
                    Anonimiza o perfil, remove o acesso e preserva somente o que
                    a legislação exige.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  className="border-danger/25 text-danger hover:bg-danger-soft hover:text-danger"
                  disabled={removeAccount.isPending}
                  onClick={() => void remove()}
                >
                  {removeAccount.isPending ? "Excluindo…" : "Excluir conta"}
                </Button>
              </Card>
            </>
          )
        )}
      </PageLayout>
      <Footer />
    </>
  );
}
