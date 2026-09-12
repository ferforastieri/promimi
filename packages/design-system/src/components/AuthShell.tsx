import type { ReactNode } from "react";
import { Card } from "./Surface.js";

/** Shared, focused layout for protected account journeys. */
export function AuthShell({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: string; children: ReactNode }) {
  return <main className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1200px] items-center gap-8 px-4 py-8 sm:px-6 md:grid-cols-[1fr_430px] lg:px-8"><section className="hidden rounded-[28px] bg-[#292f3c] p-9 text-white md:block"><p className="text-[11px] font-semibold uppercase tracking-[.13em] text-white/48">{eyebrow}</p><h1 className="mt-4 max-w-md text-[clamp(38px,4vw,52px)] font-semibold leading-[1.03] tracking-[-.065em]">{title}</h1><p className="mt-5 max-w-sm text-sm leading-7 text-white/62">{description}</p><div className="mt-10 h-1.5 w-24 rounded-full bg-brand" /></section><Card className="p-6 shadow-[0_16px_42px_rgba(28,35,52,.07)] sm:p-8">{children}</Card></main>;
}
