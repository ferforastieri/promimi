import { useState } from "react";
import type { UserRole } from "../../api/types";
import { useUpdateUserRole, useUsers } from "./hooks";
export function UserPanel() {
  const users = useUsers();
  const updateRole = useUpdateUserRole();
  const [notice, setNotice] = useState("");
  const change = async (id: string, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id, input: { role } });
      setNotice("Papel do usuário atualizado.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Não foi possível alterar o papel.",
      );
    }
  };
  const items = users.data?.data ?? [];
  return (
    <section className="rounded-2xl border border-line bg-white p-6"><p className="mb-1 font-mono text-[10px] tracking-[.14em] text-ink/45">ACESSOS</p><h2 className="text-xl font-bold tracking-tight">Usuários</h2><div className="mt-5 grid gap-2">
        {items.map((item) => (
          <article className="flex items-center justify-between gap-4 rounded-xl border border-line p-4" key={item.id}><div className="grid gap-1"><strong className="text-sm">{item.name || item.email}</strong><small className="text-xs text-ink/50">
                {item.email} ·{" "}
                {item.emailVerifiedAt ? "verificado" : "pendente"}
              </small>
            </div>
            <select
              aria-label={`Papel de ${item.email}`}
              className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-brand" value={item.role}
              disabled={updateRole.isPending}
              onChange={(event) =>
                void change(item.id, event.target.value as UserRole)
              }
            >
              <option value="VISITOR">Visitante</option>
              <option value="EDITOR">Editora</option>
              <option value="ADMIN">Administradora</option>
            </select>
          </article>
        ))}
      </div>
      {(notice || users.error) && (
        <p className="mt-4 rounded-xl bg-pine-soft px-3 py-2 text-sm text-pine">
          {notice ||
            (users.error instanceof Error
              ? users.error.message
              : "Não foi possível carregar usuários.")}
        </p>
      )}
    </section>
  );
}
