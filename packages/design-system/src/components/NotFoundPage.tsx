import { PageLayout } from "./PageLayout.js";

export function NotFoundPage({ homeHref = "/", homeLabel = "Voltar ao início", title = "Página não encontrada", description = "O endereço informado não existe ou pode ter sido movido." }: { homeHref?: string; homeLabel?: string; title?: string; description?: string }) {
  return <PageLayout className="grid min-h-screen place-items-center" width="reading"><section className="w-full border-l-4 border-brand bg-white p-8 shadow-sm sm:p-10"><p className="font-mono text-[11px] font-bold tracking-[.16em] text-brand">404</p><h1 className="mt-3 font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1><p className="mt-4 max-w-md leading-7 text-ink/65">{description}</p><a className="mt-7 inline-flex rounded-lg bg-ink px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand" href={homeHref}>{homeLabel}</a></section></PageLayout>;
}
