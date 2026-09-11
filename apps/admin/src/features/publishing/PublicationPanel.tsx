import { useState } from "react";
import { Button } from "@promimi/design-system";
import { usePublications, useUpdatePublication } from "./hooks";
const brl = (number: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    number,
  );
export function PublicationPanel() {
  const publications = usePublications();
  const update = useUpdatePublication();
  const [notice, setNotice] = useState("");
  const change = async (id: string, status: "PENDING" | "PAUSED") => {
    try {
      await update.mutateAsync({ id, input: { status } });
      setNotice(
        status === "PENDING"
          ? "Publicação recolocada na fila."
          : "Publicação pausada.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a publicação.",
      );
    }
  };
  const items = publications.data?.data ?? [];
  return (
    <section className="rounded-2xl border border-line bg-white p-6"><p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">DISTRIBUIÇÃO</p><h2 className="text-xl font-bold tracking-tight">Publicações</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-ink/55">
        Uma falha não bloqueia os outros destinos. Reenviar usa a fila
        idempotente do worker.
      </p>
      <div className="mt-5 grid gap-3">
        {items.length ? (
          items.map((item) => (
            <article className="flex flex-col justify-between gap-4 rounded-xl border border-line p-4 sm:flex-row" key={item.id}><div><strong className="text-sm">{item.offer?.title ?? "Oferta"} <em className="ml-1 font-mono text-[10px] not-italic text-brand">{item.destination}</em></strong><small className="mt-1 block text-xs text-ink/50">
                  {item.status} · {item.attempts} tentativa(s)
                  {item.error ? ` · ${item.error}` : ""}
                </small>
                <div className="mt-3 grid gap-1 rounded-xl border border-dashed border-line bg-mist p-3"><span className="w-max rounded bg-pine-soft px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase text-pine">{item.destination}</span><b className="text-sm">{item.offer?.title ?? "Oferta Promimi"}</b><strong className="text-lg text-brand">
                    {item.offer?.currentPrice === undefined
                      ? "Preço pendente"
                      : brl(Number(item.offer.currentPrice))}
                  </strong>
                  <small className="text-xs text-ink/50">
                    {item.offer?.store?.name ?? "Loja"}
                    {item.offer?.couponCode
                      ? ` · cupom ${item.offer.couponCode}`
                      : ""}
                  </small>
                  <em className="text-[10px] not-italic text-ink/50">
                    Preço conferido pela equipe. Alguns links podem render
                    comissão.
                  </em>
                </div>
              </div>
              {item.status !== "SENT" && (
                <Button
                  disabled={update.isPending}
                  onClick={() =>
                    void change(
                      item.id,
                      item.status === "PAUSED" ? "PENDING" : "PAUSED",
                    )
                  }
                >
                  {item.status === "PAUSED" ? "Retomar" : "Pausar"}
                </Button>
              )}
            </article>
          ))
        ) : (
          <p>Ainda não há publicações na fila.</p>
        )}
      </div>
      {(notice || publications.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (publications.error instanceof Error
              ? publications.error.message
              : "Não foi possível carregar publicações.")}
        </p>
      )}
    </section>
  );
}
