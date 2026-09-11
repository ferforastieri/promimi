import { useState, type FormEvent } from "react";
import { Button } from "@promimi/design-system";
import {
  useAutomationControl,
  useCreateRoutine,
  useRoutines,
  useRunRoutine,
  useUpdateAutomationControl,
  useUpdateRoutine,
} from "./hooks";
export function RoutinePanel() {
  const routines = useRoutines();
  const control = useAutomationControl();
  const createRoutine = useCreateRoutine();
  const updateRoutine = useUpdateRoutine();
  const runRoutine = useRunRoutine();
  const updateControl = useUpdateAutomationControl();
  const [notice, setNotice] = useState("");
  const paused = control.data?.data.paused ?? false;
  const items = routines.data?.data ?? [];
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const number = (name: string) =>
      form.get(name) ? Number(form.get(name)) : undefined;
    const destinations = [
      "telegram",
      "whatsapp",
      "instagram",
      "facebook",
    ].filter((destination) => form.get(destination) === "on");
    try {
      await createRoutine.mutateAsync({
        name: String(form.get("name")),
        enabled: form.get("enabled") === "on",
        scheduleCron: String(form.get("scheduleCron")),
        dailyLimit: Number(form.get("dailyLimit")),
        filters: {
          keywords: String(form.get("keywords"))
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          categories: String(form.get("categories"))
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          minPrice: number("minPrice"),
          maxPrice: number("maxPrice"),
          minDiscount: number("minDiscount"),
        },
        destinations,
      });
      event.currentTarget.reset();
      setNotice(
        "Rotina criada. O worker agenda o cron informado em horário de Brasília.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a rotina.",
      );
    }
  };
  const toggleRoutine = async (id: string, enabled: boolean) => {
    try {
      await updateRoutine.mutateAsync({ id, input: { enabled } });
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a rotina.",
      );
    }
  };
  const run = async (id: string) => {
    try {
      await runRoutine.mutateAsync(id);
      setNotice(
        "Execução manual adicionada à fila; o worker a coleta em até um minuto.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível executar a rotina.",
      );
    }
  };
  const toggleAutomation = async () => {
    try {
      await updateControl.mutateAsync({ paused: !paused });
      setNotice(
        !paused
          ? "Automação geral pausada. Itens na fila ficam preservados."
          : "Automação geral retomada.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar a automação geral.",
      );
    }
  };
  return (
    <section className="rounded-2xl border border-line bg-white p-6"><p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">AUTOMAÇÃO</p><h2 className="text-xl font-bold tracking-tight">Rotinas de publicação</h2><div className="mt-5 flex flex-col justify-between gap-4 rounded-xl border border-brand/20 bg-brand/5 p-4 sm:flex-row sm:items-center"><div className="grid gap-1"><strong className="text-sm">
            {paused ? "Automação geral pausada" : "Automação geral ativa"}
          </strong>
          <small className="text-xs text-ink/55">
            {paused
              ? "O worker preserva a fila e não envia novos itens."
              : "Rotinas habilitadas usam o cron salvo em horário de Brasília."}
          </small>
        </div>
        <Button
          disabled={updateControl.isPending}
          onClick={() => void toggleAutomation()}
        >
          {paused ? "Retomar geral" : "Pausar geral"}
        </Button>
      </div>
      <div className="mt-4 grid gap-2">
        {items.map((item) => (
          <article className="flex flex-col justify-between gap-3 rounded-xl bg-mist p-4 sm:flex-row sm:items-center" key={item.id}><div className="grid gap-1"><strong className="text-sm">{item.name}</strong><small className="text-xs text-ink/55">
                {item.scheduleCron} · {item.dailyLimit} ofertas/dia ·{" "}
                {item.enabled ? "ativa" : "pausada"}
              </small>
            </div>
            <span className="flex gap-3">
              <button
                className="text-xs font-bold text-brand hover:underline disabled:opacity-40" disabled={runRoutine.isPending}
                onClick={() => void run(item.id)}
              >
                Executar
              </button>
              <button
                className="text-xs font-bold text-brand hover:underline disabled:opacity-40" disabled={updateRoutine.isPending}
                onClick={() => void toggleRoutine(item.id, !item.enabled)}
              >
                {item.enabled ? "Pausar" : "Retomar"}
              </button>
            </span>
          </article>
        ))}
      </div>
      <form className="mt-6 grid max-w-3xl gap-4" onSubmit={create}><label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Nome
          <input
            className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="name"
            required
            minLength={3}
            placeholder="Tecnologia até R$ 2.000"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Cron (Brasília)
          <input
            className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="scheduleCron"
            required
            defaultValue="0 * * * *"
            pattern="\S+(\s+\S+){4}"
          />
          <small className="text-xs font-normal text-ink/50">Ex.: `0 * * * *` executa a cada hora.</small>
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Palavras-chave
          <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="keywords" placeholder="fone, notebook, teclado" />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Categorias da fonte
          <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="categories" placeholder="Tecnologia, Games" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Preço mínimo
            <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="minPrice" type="number" min="1" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Preço máximo
            <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="maxPrice" type="number" min="1" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Desconto mínimo (%)
            <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="minDiscount" type="number" min="1" max="99" />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Limite diário
            <input
              className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="dailyLimit"
              type="number"
              min="1"
              max="100"
              defaultValue="100"
            />
          </label>
        </div>
        <fieldset className="flex flex-wrap gap-4 rounded-xl border border-line p-4">
          <legend>Destinos</legend>
          {["telegram", "whatsapp", "instagram", "facebook"].map(
            (destination) => (
              <label className="flex items-center gap-1.5 text-sm" key={destination}>
                <input name={destination} type="checkbox" /> {destination}
              </label>
            ),
          )}
        </fieldset>
        <label className="flex items-center gap-2 text-sm font-bold text-ink/70">
          <input name="enabled" type="checkbox" defaultChecked /> Ativar rotina
        </label>
        <Button disabled={createRoutine.isPending}>Criar rotina</Button>
      </form>
      {(notice || routines.error || control.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (routines.error instanceof Error
              ? routines.error.message
              : control.error instanceof Error
                ? control.error.message
                : "Não foi possível carregar automações.")}
        </p>
      )}
    </section>
  );
}
