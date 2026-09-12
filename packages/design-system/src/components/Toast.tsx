import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";
type ToastInput = { title: string; description?: string; tone?: ToastTone; duration?: number };
type Toast = ToastInput & { id: number };
type ToastContextValue = { showToast: (input: ToastInput) => void; dismissToast: (id: number) => void };

const ToastContext = createContext<ToastContextValue | null>(null);
const tones: Record<ToastTone, string> = { success: "border-pine/25 bg-pine-soft text-pine", error: "border-danger/25 bg-danger-soft text-danger", info: "border-line bg-white text-ink" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismissToast = useCallback((id: number) => setToasts((items) => items.filter((item) => item.id !== id)), []);
  const showToast = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((items) => [...items.slice(-3), { ...input, id }]);
    const duration = input.duration ?? 4500;
    if (duration > 0) window.setTimeout(() => dismissToast(id), duration);
  }, [dismissToast]);
  const value = useMemo(() => ({ showToast, dismissToast }), [dismissToast, showToast]);
  return <ToastContext.Provider value={value}>{children}<div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4" aria-live="polite" aria-atomic="true">{toasts.map((toast) => <div className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${tones[toast.tone ?? "info"]}`} key={toast.id} role={toast.tone === "error" ? "alert" : "status"}><div className="min-w-0 flex-1"><strong className="block text-sm">{toast.title}</strong>{toast.description && <p className="mt-0.5 text-xs leading-5 opacity-80">{toast.description}</p>}</div><button className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-md text-lg leading-none opacity-70 transition hover:bg-black/5 hover:opacity-100" aria-label="Fechar aviso" onClick={() => dismissToast(toast.id)}>×</button></div>)}</div></ToastContext.Provider>;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}
