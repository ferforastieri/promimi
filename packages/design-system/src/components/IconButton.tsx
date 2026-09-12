import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({ label, children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return <button aria-label={label} title={label} className={`grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-base text-ink/60 shadow-[0_1px_2px_rgba(26,32,44,.03)] transition hover:border-brand/25 hover:bg-brand-soft hover:text-brand disabled:pointer-events-none disabled:opacity-45 ${className}`} {...props}>{children}</button>;
}
