import { useState, type FormEvent } from "react";
import { Button, StatusPill } from "@promimi/design-system";
import type { AdminOffer } from "../../api/features/offers/list-offers";
import { useUpdateOffer } from "./hooks";

const brl = (number: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    number,
  );
const statusLabel = (status: AdminOffer["status"]) =>
  status === "PUBLISHED"
    ? "Publicada"
    : status === "DRAFT"
      ? "Rascunho"
      : status === "PAUSED"
        ? "Pausada"
        : "Expirada";

export function OfferTable({ offers }: { offers: AdminOffer[] }) {
  const update = useUpdateOffer();
  const [notice, setNotice] = useState("");
  const changeStatus = async (
    offer: AdminOffer,
    status: AdminOffer["status"],
  ) => {
    try {
      await update.mutateAsync({ id: offer.id, input: { status } });
      setNotice(
        status === "EXPIRED"
          ? "Oferta expirada e retirada do catálogo."
          : status === "PUBLISHED"
            ? "Oferta publicada e encaminhada para os destinos habilitados."
            : "Status da oferta atualizado.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a oferta.",
      );
    }
  };
  const edit = async (offer: AdminOffer, event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await update.mutateAsync({
        id: offer.id,
        input: {
          title: String(form.get("title")),
          currentPrice: Number(form.get("currentPrice")),
          originalPrice: form.get("originalPrice")
            ? Number(form.get("originalPrice"))
            : null,
          couponCode: String(form.get("couponCode") || "") || null,
        },
      });
      setNotice("Oferta editada.");
      (
        event.currentTarget.closest("details") as HTMLDetailsElement | null
      )?.removeAttribute("open");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível editar a oferta.",
      );
    }
  };
  return (
    <div>
      <div className="hidden grid-cols-[minmax(12rem,1fr)_6rem_6rem_5rem_9rem] gap-3 bg-mist px-5 py-3 text-[10px] font-bold uppercase tracking-wide text-ink/45 md:grid">
        <span>Oferta</span>
        <span>Preço</span>
        <span>Status</span>
        <span>Atualizada</span>
        <span>Ações</span>
      </div>
      {notice && <p className="border-b border-pine/15 bg-pine-soft px-5 py-3 text-xs font-bold text-pine">{notice}</p>}
      {offers.length ? (
        offers.slice(0, 20).map((offer, index) => (
          <div className="grid gap-3 border-t border-line/70 px-5 py-4 md:grid-cols-[minmax(12rem,1fr)_6rem_6rem_5rem_9rem] md:items-center" key={offer.id}>
            <div className="flex min-w-0 items-center gap-3">
              <span className={`h-9 w-9 shrink-0 rounded-lg ${["bg-blue-100", "bg-orange-100", "bg-emerald-100", "bg-violet-100"][index % 4]}`} />
              <div className="min-w-0"><b className="block truncate text-sm">{offer.title}</b><small className="text-xs text-ink/50">{offer.store.name}</small></div>
            </div>
            <strong className="text-sm">{brl(offer.currentPrice)}</strong>
            <StatusPill
              tone={
                offer.status === "PUBLISHED"
                  ? "green"
                  : offer.status === "EXPIRED"
                    ? "red"
                    : "orange"
              }
            >
              {statusLabel(offer.status)}
            </StatusPill>
            <small className="text-xs text-ink/50">
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "short",
                timeZone: "America/Sao_Paulo",
              }).format(new Date(offer.updatedAt))}
            </small>
            <span className="flex flex-wrap items-center gap-2">
              <details className="relative">
                <summary className="cursor-pointer text-xs font-bold text-ink/65 hover:text-brand">Editar</summary>
                <form className="absolute right-0 z-10 mt-2 grid w-56 gap-2 rounded-xl border border-line bg-white p-3 shadow-xl" onSubmit={(event) => void edit(offer, event)}>
                  <label className="grid gap-1 text-xs font-bold text-ink/65">
                    Título
                    <input
                      name="title"
                      required
                      minLength={8}
                      className="rounded-lg border border-line px-2 py-1.5 font-normal outline-none focus:border-brand"
                      defaultValue={offer.title}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-ink/65">
                    Preço atual
                    <input
                      name="currentPrice"
                      required
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="rounded-lg border border-line px-2 py-1.5 font-normal outline-none focus:border-brand"
                      defaultValue={offer.currentPrice}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-ink/65">
                    Preço anterior
                    <input
                      name="originalPrice"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="rounded-lg border border-line px-2 py-1.5 font-normal outline-none focus:border-brand"
                      defaultValue={offer.originalPrice ?? ""}
                    />
                  </label>
                  <label className="grid gap-1 text-xs font-bold text-ink/65">
                    Cupom
                    <input
                      name="couponCode"
                      className="rounded-lg border border-line px-2 py-1.5 font-normal outline-none focus:border-brand"
                      defaultValue={offer.couponCode ?? ""}
                    />
                  </label>
                  <Button className="min-h-8 px-3 py-1.5 text-xs" disabled={update.isPending}>Salvar edição</Button>
                </form>
              </details>
              {offer.status !== "PUBLISHED" && (
                <button className="text-xs font-bold text-pine hover:underline disabled:opacity-40"
                  disabled={update.isPending}
                  onClick={() => void changeStatus(offer, "PUBLISHED")}
                >
                  Publicar
                </button>
              )}
              {offer.status === "PUBLISHED" && (
                <button className="text-xs font-bold text-amber hover:underline disabled:opacity-40"
                  disabled={update.isPending}
                  onClick={() => void changeStatus(offer, "PAUSED")}
                >
                  Pausar
                </button>
              )}
              {offer.status !== "EXPIRED" && (
                <button className="text-xs font-bold text-danger hover:underline disabled:opacity-40"
                  disabled={update.isPending}
                  onClick={() => void changeStatus(offer, "EXPIRED")}
                >
                  Expirar
                </button>
              )}
            </span>
          </div>
        ))
      ) : (
        <p className="px-5 py-8 text-sm text-ink/55">
          Nenhuma oferta cadastrada. Cadastre a primeira oferta manual.
        </p>
      )}
    </div>
  );
}
