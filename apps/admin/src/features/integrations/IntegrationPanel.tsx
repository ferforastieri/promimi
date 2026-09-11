import { useState, type FormEvent } from "react";
import { Button } from "@promimi/design-system";
import {
  useIntegrations,
  useUpdateIntegration,
  useValidateWhatsApp,
} from "./hooks";
export function IntegrationPanel() {
  const providers = [
    "amazon",
    "mercado-livre",
    "shopee",
    "telegram",
    "whatsapp",
    "instagram",
    "facebook",
    "x",
  ];
  const integrations = useIntegrations();
  const update = useUpdateIntegration();
  const validate = useValidateWhatsApp();
  const [provider, setProvider] = useState(providers[0]);
  const [notice, setNotice] = useState("");
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const credentials = String(form.get("credentials")).trim();
      const settings = String(form.get("settings")).trim();
      await update.mutateAsync({
        provider,
        input: {
          enabled: form.get("enabled") === "on",
          settings: settings ? JSON.parse(settings) : {},
          credentials: credentials ? JSON.parse(credentials) : undefined,
        },
      });
      setNotice(
        `${provider} foi salvo. Segredos são cifrados antes de entrar no banco.`,
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Revise o JSON de configurações e credenciais.",
      );
    }
  };
  const validateWhatsApp = async () => {
    try {
      const response = await validate.mutateAsync();
      setNotice(
        response.ok
          ? "Todos os destinos foram validados. Agora você pode ativar o WhatsApp."
          : "Alguns destinos não foram validados. Revise o número dedicado e as permissões.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível validar os destinos.",
      );
    }
  };
  const items = integrations.data?.data ?? [];
  return (
    <section className="rounded-2xl border border-line bg-white p-6"><p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">CONEXÕES</p><h2 className="text-xl font-bold tracking-tight">Integrações e destinos</h2><p className="mt-2 text-sm leading-6 text-ink/55">
        Ative apenas após validar a conta e o destino. Cada falha pausa somente
        esta integração.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {providers.map((item) => (
          <span
            key={item}
            className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${
              items.find((integration) => integration.provider === item)
                ?.enabled
                ? "bg-pine-soft text-pine"
                : "bg-ink/6 text-ink/50"}`}
          >
            {item}
          </span>
        ))}
      </div>
      <form className="mt-6 grid max-w-2xl gap-4" onSubmit={save}><label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Provedor
          <select
            className="rounded-xl border border-line bg-white px-3 py-2.5 font-normal outline-none focus:border-brand" name="provider"
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
          >
            {providers.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm font-bold text-ink/70">
          <input name="enabled" type="checkbox" /> Ativar após salvar
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Configurações JSON
          <textarea className="min-h-24 rounded-xl border border-line px-3 py-2.5 font-mono text-xs font-normal outline-none focus:border-brand" name="settings" placeholder='{"feedUrl":"https://..."}' />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Credenciais JSON
          <textarea
            className="min-h-24 rounded-xl border border-line px-3 py-2.5 font-mono text-xs font-normal outline-none focus:border-brand" name="credentials"
            placeholder={
              provider === "whatsapp"
                ? '{"bridgeUrl":"http://whatsapp:3100","bridgeToken":"...","destinations":"120...@g.us"}'
                : '{"botToken":"...","chatId":"..."}'
            }
          />
        </label>
        {provider === "whatsapp" && (
          <div className="grid gap-2 rounded-xl border-l-4 border-brand bg-brand/5 p-4"><strong className="text-sm">Validação do WhatsApp</strong><small className="text-xs leading-5 text-ink/55">
              Salve desligado, valide todos os grupos/canais e só então marque a
              ativação.
            </small>
            <Button
              type="button"
              disabled={validate.isPending}
              onClick={() => void validateWhatsApp()}
            >
              Validar destinos salvos
            </Button>
          </div>
        )}
        <Button disabled={update.isPending}>Salvar integração</Button>
      </form>
      {(notice || integrations.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (integrations.error instanceof Error
              ? integrations.error.message
              : "Não foi possível carregar integrações.")}
        </p>
      )}
    </section>
  );
}
