import { useState, type FormEvent } from "react";
import {
  BrandMark,
  Button,
  Card,
  Field,
  Input,
  StatusPill,
  useToast,
} from "@promimi/design-system";
import { useLogin, useLogout } from "./hooks";

export function LoginScreen() {
  const [error, setError] = useState("");
  const { showToast } = useToast();
  const login = useLogin();
  const logout = useLogout();
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const result = await login.mutateAsync({
        email: String(form.get("email")),
        password: String(form.get("password")),
        totpCode: String(form.get("totpCode") || "") || undefined,
      });
      if (result.user.role !== "ADMIN" && result.user.role !== "EDITOR") {
        await logout.mutateAsync();
        throw new Error("Esta conta não tem acesso ao painel.");
      }
    } catch (reason) {
      const message =
        reason instanceof Error ? reason.message : "Não foi possível entrar.";
      setError(message);
      showToast({
        title: "Não foi possível entrar",
        description: message,
        tone: "error",
      });
    }
  };
  return (
    <main className="grid min-h-screen place-items-center bg-mist p-4 sm:p-8">
      <div className="grid w-full max-w-[980px] overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_24px_70px_rgba(28,35,52,.1)] md:grid-cols-[1.05fr_.95fr]">
        <section className="hidden min-h-[600px] flex-col justify-between bg-[#272d3a] p-9 text-white md:flex">
          <a
            className="inline-flex w-max items-center gap-2.5 rounded-2xl bg-white/10 px-3.5 py-2.5 text-[22px] font-semibold tracking-[-.08em]"
            href="/"
          >
            <BrandMark className="h-8 w-8" label="" />
            <span>
              pro<b>mimi</b>
              <i className="not-italic text-brand">•</i>
            </span>
          </a>
          <div>
            <StatusPill tone="orange">Painel operacional</StatusPill>
            <h1 className="mt-5 max-w-sm text-[42px] font-semibold leading-[1.03] tracking-[-.06em]">
              Boas decisões começam com uma operação clara.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/62">
              Gerencie ofertas, integrações e automações em um ambiente
              protegido.
            </p>
          </div>
          <p className="text-xs text-white/40">
            Promimi · acesso restrito à equipe
          </p>
        </section>
        <div className="p-6 sm:p-9">
          <a
            className="inline-flex items-center gap-2 text-[22px] font-semibold tracking-[-.08em] md:hidden"
            href="/"
          >
            <BrandMark className="h-7 w-7" label="" />
            <span>
              pro<b>mimi</b>
              <i className="not-italic text-brand">•</i>
            </span>
          </a>
          <h2 className="mt-8 text-2xl font-semibold tracking-[-.04em] md:mt-0">
            Entrar no painel
          </h2>
          <p className="mt-2 text-sm leading-6 text-ink/55">
            Use sua conta de administradora ou editora.
          </p>
          <form className="mt-7 grid gap-4" onSubmit={submit}>
            <Field label="E-mail">
              <Input
                name="email"
                required
                type="email"
                autoComplete="email"
                placeholder="voce@exemplo.com"
              />
            </Field>
            <Field label="Senha">
              <Input
                name="password"
                required
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
              />
            </Field>
            <Field
              label="Código TOTP"
              hint="Preencha somente quando a autenticação em duas etapas estiver ativa."
            >
              <Input
                name="totpCode"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                placeholder="000000"
              />
            </Field>
            {error && (
              <p className="rounded-xl border border-danger/15 bg-danger-soft px-3.5 py-3 text-sm text-danger">
                {error}
              </p>
            )}
            <Button
              className="mt-1 w-full"
              size="lg"
              disabled={login.isPending}
            >
              {login.isPending ? "Entrando…" : "Entrar com segurança"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
