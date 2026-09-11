import type { ReactNode } from "react";

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "red" | "orange";
}) {
  const tones = { neutral: "bg-ink/7 text-ink/65", green: "bg-pine-soft text-pine", red: "bg-danger-soft text-danger", orange: "bg-amber-soft text-amber" };
  return <span className={`inline-flex w-max items-center rounded-full px-2.5 py-1 text-[11px] font-bold ${tones[tone]}`}>{children}</span>;
}
