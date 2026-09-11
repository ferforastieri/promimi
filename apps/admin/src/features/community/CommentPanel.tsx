import { useState } from "react";
import { Button } from "@promimi/design-system";
import { useComments, useUpdateComment } from "./hooks";
export function CommentPanel() {
  const comments = useComments();
  const update = useUpdateComment();
  const [message, setMessage] = useState("");
  const moderate = async (id: string, isHidden: boolean) => {
    try {
      await update.mutateAsync({ id, input: { isHidden } });
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Não foi possível moderar o comentário.",
      );
    }
  };
  const items = comments.data?.data ?? [];
  return (
    <section className="rounded-2xl border border-line bg-white p-6">
      <p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">MODERAÇÃO</p><h2 className="text-xl font-bold tracking-tight">Comentários</h2>
      {(message || comments.error) && (
        <p className="mt-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {message ||
            (comments.error instanceof Error
              ? comments.error.message
              : "Não foi possível carregar comentários.")}
        </p>
      )}
      <div className="mt-5 grid gap-2">
        {items.length ? (
          items.map((item) => (
            <article className="flex items-center justify-between gap-4 rounded-xl border border-line p-4" key={item.id}><div className="grid gap-1"><strong className="text-sm">{item.body}</strong><small className="text-xs text-ink/50">{item.user?.email ?? "Visitante"} · {item.offer?.title ?? "Oferta removida"}</small></div>
              <Button
                disabled={update.isPending}
                onClick={() => void moderate(item.id, !item.isHidden)}
              >
                {item.isHidden ? "Restaurar" : "Ocultar"}
              </Button>
            </article>
          ))
        ) : (
          <p>Nenhum comentário para moderar.</p>
        )}
      </div>
    </section>
  );
}
