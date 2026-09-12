import { useEffect } from "react";
import { Link, useSearchParams } from "react-router";
import { AuthShell, Skeleton, StatusPill } from "@promimi/design-system";
import { PublicHeader } from "@promimi/design-system";
import { useVerifyEmail } from "../hooks";

export default function VerifyEmail() {
  const [params] = useSearchParams();
  const verify = useVerifyEmail();
  const token = params.get("token");
  useEffect(() => {
    if (token && !verify.isPending && !verify.isSuccess && !verify.isError)
      verify.mutate(token);
  }, [token, verify]);
  const state =
    !token || verify.isError ? "error" : verify.isSuccess ? "done" : "loading";
  const message = !token
    ? "Este link de confirmação é inválido."
    : verify.isError
      ? verify.error instanceof Error
        ? verify.error.message
        : "Não foi possível confirmar este e-mail."
      : "E-mail confirmado. Sua conta está pronta para usar.";
  return (
    <>
      <PublicHeader />
      <AuthShell
        eyebrow="Confirmação de e-mail"
        title={
          <>
            Seu radar
            <br />
            <span className="text-[#ff967d]">quase pronto.</span>
          </>
        }
        description="Confirmar o e-mail ajuda a manter a conversa sobre ofertas segura."
      >
        {state === "loading" ? (
          <div
            className="grid gap-4"
            aria-label="Confirmando e-mail"
            role="status"
          >
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <>
            <StatusPill tone={state === "error" ? "red" : "green"}>
              {state === "done" ? "Tudo certo" : "Link indisponível"}
            </StatusPill>
            <h2 className="mt-5 text-2xl font-semibold tracking-[-.04em]">
              {state === "done" ? "Tudo certo" : "Não foi possível confirmar"}
            </h2>
            <p
              className={`mt-4 rounded-xl px-3.5 py-3 text-sm leading-6 ${state === "error" ? "bg-danger-soft text-danger" : "bg-pine-soft text-pine"}`}
            >
              {message}
            </p>
            <Link
              className="mt-6 inline-block text-sm font-semibold text-brand"
              to={state === "done" ? "/conta" : "/entrar"}
            >
              {state === "done" ? "Abrir minha conta" : "Voltar para entrar"}
            </Link>
          </>
        )}
      </AuthShell>
    </>
  );
}
