import { useState } from "react";
import { Link } from "react-router";
import { AuthShell, Button, Field, Input } from "@promimi/design-system";
import { PublicHeader } from "@promimi/design-system";
import { useRequestPasswordReset } from "../hooks";

export default function Recover() {
  const [notice, setNotice] = useState("");
  const reset = useRequestPasswordReset();
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await reset.mutateAsync(
        String(new FormData(event.currentTarget).get("email")),
      );
      setNotice(
        "Se este e-mail estiver cadastrado, enviamos as instruções de recuperação.",
      );
    } catch {
      setNotice(
        "Não foi possível solicitar a recuperação agora. Tente novamente.",
      );
    }
  };
  return (
    <>
      <PublicHeader />
      <AuthShell
        eyebrow="Recuperar acesso"
        title={
          <>
            Vamos achar
            <br />
            <span className="text-[#ff967d]">seu radar.</span>
          </>
        }
        description="Informe seu e-mail. Por segurança, mostramos a mesma confirmação para qualquer endereço."
      >
        <h2 className="text-2xl font-semibold tracking-[-.04em]">
          Redefinir senha
        </h2>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          <Field label="E-mail">
            <Input
              disabled={reset.isPending}
              required
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
            />
          </Field>
          <Button size="lg" disabled={reset.isPending}>
            {reset.isPending ? "Enviando…" : "Enviar instruções"}
          </Button>
        </form>
        {notice && (
          <p className="mt-4 rounded-xl bg-pine-soft px-3.5 py-3 text-sm leading-6 text-pine">
            {notice}
          </p>
        )}
        <Link
          className="mt-6 inline-block text-xs font-semibold text-brand"
          to="/entrar"
        >
          Voltar para entrar
        </Link>
      </AuthShell>
    </>
  );
}
