import { useState } from "react";
import { Link } from "react-router";
import {
  AuthShell,
  Button,
  Field,
  Input,
  TextButton,
  useToast,
} from "@promimi/design-system";
import { Header } from "../../shell/components";
import { useLogin, useRegister } from "../hooks";

export default function Login() {
  const [create, setCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const { showToast } = useToast();
  const login = useLogin();
  const register = useRegister();
  const pending = login.isPending || register.isPending;
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      email: String(form.get("email")),
      password: String(form.get("password")),
      ...(create ? { name: String(form.get("name")) } : {}),
    };
    try {
      await (create ? register : login).mutateAsync(payload);
      const message = create
        ? "Conta criada. Confira seu e-mail para confirmar o acesso."
        : "Você entrou. Já pode favoritar e comentar.";
      setNotice(message);
      showToast({
        title: create ? "Conta criada" : "Acesso confirmado",
        description: message,
        tone: "success",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível entrar.";
      setNotice(message);
      showToast({
        title: "Não foi possível entrar",
        description: message,
        tone: "error",
      });
    }
  };
  return (
    <>
      <Header />
      <AuthShell
        eyebrow="Sua conta Promimi"
        title={
          <>
            Guarde o que
            <br />
            <span className="text-[#ff967d]">vale a pena.</span>
          </>
        }
        description="Favorite ofertas, acompanhe seus achados e participe com respeito nos comentários."
      >
        <h2 className="text-2xl font-semibold tracking-[-.04em]">
          {create ? "Criar conta" : "Entrar"}
        </h2>
        <p className="mt-2 text-sm text-ink/55">
          {create
            ? "Crie seu radar em poucos passos."
            : "Acesse seus favoritos e sua atividade."}
        </p>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          {create && (
            <Field label="Nome">
              <Input
                disabled={pending}
                required
                name="name"
                minLength={2}
                placeholder="Como podemos chamar você?"
              />
            </Field>
          )}
          <Field label="E-mail">
            <Input
              disabled={pending}
              required
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
            />
          </Field>
          <Field label="Senha">
            <Input
              disabled={pending}
              required
              name="password"
              type="password"
              minLength={10}
              placeholder="No mínimo 10 caracteres"
            />
          </Field>
          <Button
            className="mt-1 w-full"
            size="lg"
            disabled={pending}
            type="submit"
          >
            {pending
              ? "Aguarde…"
              : create
                ? "Criar minha conta"
                : "Entrar na minha conta"}
          </Button>
        </form>
        {notice && (
          <p className="mt-4 rounded-xl border border-pine/15 bg-pine-soft px-3.5 py-3 text-sm leading-6 text-pine">
            {notice}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <Link className="font-semibold text-brand" to="/recuperar-acesso">
            Esqueci minha senha
          </Link>
          <span className="text-ink/55">
            {create ? "Já tem conta?" : "Ainda não tem conta?"}{" "}
            <TextButton
              type="button"
              disabled={pending}
              className="text-xs text-brand"
              onClick={() => setCreate(!create)}
            >
              {create ? "Entrar" : "Criar conta"}
            </TextButton>
          </span>
        </div>
      </AuthShell>
    </>
  );
}
