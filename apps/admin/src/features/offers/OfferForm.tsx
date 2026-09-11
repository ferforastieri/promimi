import { useState, type FormEvent } from "react";
import { Button } from "@promimi/design-system";
import type { CategoryOption } from "../../api/features/catalog/list-categories";
import type { StoreOption } from "../../api/features/catalog/list-stores";
import { useCreateOffer } from "./hooks";

export function OfferForm({
  stores,
  categories,
  onCancel,
  onSaved,
}: {
  stores: StoreOption[];
  categories: CategoryOption[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const create = useCreateOffer();
  const [error, setError] = useState("");
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await create.mutateAsync({
        title: String(form.get("title")),
        storeId: String(form.get("storeId")),
        categoryId: String(form.get("categoryId") || "") || null,
        currentPrice: Number(form.get("currentPrice")),
        originalPrice: form.get("originalPrice")
          ? Number(form.get("originalPrice"))
          : null,
        affiliateUrl: String(form.get("affiliateUrl")),
        couponCode: String(form.get("couponCode") || "") || null,
        status: form.get("status") === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      });
      onSaved();
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível salvar a oferta.",
      );
    }
  };
  return (
    <div className="fixed inset-0 z-30 grid place-items-center bg-ink/45 p-4" role="dialog" aria-modal="true">
      <form className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl" onSubmit={save}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">NOVA OFERTA</p>
            <h2 className="text-xl font-bold tracking-tight">Cadastrar manualmente</h2>
          </div>
          <button className="grid h-9 w-9 place-items-center rounded-lg text-xl hover:bg-ink/5" type="button" onClick={onCancel}>
            ×
          </button>
        </div>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Título da oferta
          <input
            required
            name="title"
            minLength={8}
            className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand"
            placeholder="Ex.: Fone Bluetooth com cancelamento de ruído"
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Loja
            <select className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" required name="storeId" defaultValue="">
              <option disabled value="">
                Selecione
              </option>
              {stores.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Categoria
            <select className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="categoryId" defaultValue="">
              <option value="">Sem categoria</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Preço atual (R$)
            <input
              required
              name="currentPrice"
              type="number"
              step="0.01"
              className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand"
              min="0.01"
            />
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-ink/70">
            Preço original (R$)
            <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="originalPrice" type="number" step="0.01" min="0.01" />
          </label>
        </div>
        <label className="mt-4 grid gap-1.5 text-sm font-bold text-ink/70">
          Link da oferta
          <input
            required
            name="affiliateUrl"
            type="url"
            className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand"
            placeholder="https://"
          />
        </label>
        <label className="mt-4 grid gap-1.5 text-sm font-bold text-ink/70">
          Cupom (opcional)
          <input className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="couponCode" placeholder="EX.: PROMIMI10" />
        </label>
        <label className="mt-4 grid gap-1.5 text-sm font-bold text-ink/70">
          Status
          <select className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="status" defaultValue="DRAFT">
            <option value="DRAFT">Salvar como rascunho</option>
            <option value="PUBLISHED">Publicar agora</option>
          </select>
        </label>
        {error && <p className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
        <div className="mt-6 flex justify-end gap-2">
          <button className="rounded-xl px-4 py-2 text-sm font-bold text-ink/60 hover:bg-ink/5" type="button" onClick={onCancel}>
            Cancelar
          </button>
          <Button disabled={create.isPending}>
            {create.isPending ? "Salvando…" : "Salvar oferta"}
          </Button>
        </div>
      </form>
    </div>
  );
}
