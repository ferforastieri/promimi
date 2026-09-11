import { useState, type FormEvent } from "react";
import { Button } from "@promimi/design-system";
import {
  useCreateCategory,
  useManagedCategories,
  useUpdateCategory,
} from "./hooks";
export function CategoryPanel() {
  const categories = useManagedCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const [notice, setNotice] = useState("");
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await createCategory.mutateAsync({
        name: String(form.get("name")),
        description: String(form.get("description") || "") || null,
        isActive: true,
      });
      event.currentTarget.reset();
      setNotice("Categoria criada e disponível no catálogo.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível criar a categoria.",
      );
    }
  };
  const toggle = async (id: string, isActive: boolean) => {
    try {
      await updateCategory.mutateAsync({ id, input: { isActive: !isActive } });
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a categoria.",
      );
    }
  };
  const items = categories.data?.data ?? [];
  return (
    <section className="rounded-2xl border border-line bg-white p-6"><p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">CATÁLOGO</p><h2 className="text-xl font-bold tracking-tight">Categorias</h2><div className="mt-5 grid gap-2">
        {items.map((item) => (
          <article className="flex items-center justify-between gap-4 rounded-xl border border-line p-4" key={item.id}><div className="grid gap-1"><strong className="text-sm">{item.name}</strong><small className="text-xs text-ink/50">{item.description || "Sem descrição"}</small>
            </div>
            <Button
              disabled={updateCategory.isPending}
              onClick={() => void toggle(item.id, item.isActive)}
            >
              {item.isActive ? "Desativar" : "Ativar"}
            </Button>
          </article>
        ))}
      </div>
      <form className="mt-6 grid max-w-xl gap-4" onSubmit={create}><label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Nome
          <input
            name="name"
            required
            minLength={2}
            className="rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" placeholder="Ex.: Games e consoles"
          />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-ink/70">
          Descrição
          <textarea
            className="min-h-24 rounded-xl border border-line px-3 py-2.5 font-normal outline-none focus:border-brand" name="description"
            placeholder="Ajuda a organizar as ofertas"
          />
        </label>
        <Button disabled={createCategory.isPending}>Criar categoria</Button>
      </form>
      {(notice || categories.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (categories.error instanceof Error
              ? categories.error.message
              : "Não foi possível carregar categorias.")}
        </p>
      )}
    </section>
  );
}
