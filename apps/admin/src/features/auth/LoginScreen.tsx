import { useState, type FormEvent } from "react";
import { BrandMark, Button, useToast } from "@promimi/design-system";
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
      const message = reason instanceof Error ? reason.message : "Não foi possível entrar.";
      setError(message);
      showToast({ title: "Não foi possível entrar", description: message, tone: "error" });
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-mist p-5">
      <form className="grid w-full max-w-md gap-4 rounded-2xl border border-line bg-white p-7 shadow-sm" onSubmit={submit}>
        <a className="mb-3 text-3xl tracking-[-.12em] text-ink" href="/">
          <BrandMark className="h-8 w-8" label="" /><span>pro</span>
          <b>mimi</b>
          <i className="not-italic text-brand">•</i><small className="ml-3 font-mono text-[10px] tracking-[.15em] text-ink/45">PAINEL</small>
        </a>
        <h1 className="text-2xl font-bold tracking-tight">Entrar na operação</h1><p className="-mt-2 text-sm leading-6 text-ink/55">Use uma conta de administradora ou editora.</p>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          E-mail
          <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="email" required type="email" autoComplete="email" />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Senha
          <input
            className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="password"
            required
            type="password"
            autoComplete="current-password"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Código TOTP <small>se ativado</small>
          <input
            className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="totpCode"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
          />
        </label>
        {error && <p className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <Button disabled={login.isPending}>
          {login.isPending ? "Entrando…" : "Entrar no painel"}
        </Button>
      </form>
    </main>
  );
}
