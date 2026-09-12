import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
const variants: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white shadow-[0_5px_14px_rgba(238,77,45,.22)] hover:bg-brand-dark",
  secondary: "border border-line bg-white text-ink shadow-[0_1px_2px_rgba(26,32,44,.04)] hover:border-brand/30 hover:bg-brand-soft",
  ghost: "bg-transparent text-ink/70 hover:bg-surface-subtle hover:text-ink",
  subtle: "bg-surface-subtle text-ink/75 hover:bg-[#e8ebf1] hover:text-ink",
  danger: "bg-danger text-white shadow-[0_5px_14px_rgba(223,76,91,.16)] hover:bg-[#c83b4b]",
};
const sizes: Record<ButtonSize, string> = {
  sm: "min-h-8 rounded-lg px-3 text-xs",
  md: "min-h-10 rounded-xl px-4 text-sm",
  lg: "min-h-12 rounded-xl px-5 text-sm",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  leading,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize; leading?: ReactNode }) {
  return (
    <button className={`inline-flex items-center justify-center gap-2 font-semibold transition duration-150 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {leading}{children}
    </button>
  );
}
