import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Button({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={`pm-button ${className}`} {...props}>{children}</button>;
}

export function StatusPill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "red" | "orange" }) {
  return <span className={`pm-pill pm-pill--${tone}`}>{children}</span>;
}
