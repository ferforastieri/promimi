import type { ReactNode } from "react";
import { Icon, type IconName } from "./Icon.js";
import { BrandLockup } from "./BrandLockup.js";
import { AppFrame } from "./PageLayout.js";
import { IconButton } from "./IconButton.js";
import { LoadingCard, Skeleton, TableSkeleton } from "./Feedback.js";

export type WorkspaceNavigationItem = { id: string; label: string; icon: IconName };

function WorkspaceNavigation({ items, activeItem, onNavigate }: { items: readonly WorkspaceNavigationItem[]; activeItem: string; onNavigate: (id: string) => void }) {
  return <nav className="flex gap-1 overflow-x-auto p-1 xl:overflow-visible" aria-label="Navegação do painel">{items.map((item) => <button key={item.id} aria-current={activeItem === item.id ? "page" : undefined} aria-label={item.label} title={item.label} onClick={() => onNavigate(item.id)} className={`inline-flex shrink-0 items-center gap-2 rounded-[14px] px-3 py-2 text-[11px] font-medium transition ${activeItem === item.id ? "bg-brand text-white shadow-[0_4px_10px_rgba(238,77,45,.16)]" : "text-ink/62 hover:bg-surface-subtle hover:text-ink"}`}><Icon name={item.icon} className="h-3.5 w-3.5 xl:hidden" /><span>{item.label}</span></button>)}</nav>;
}

function WorkspaceRail({ items, activeItem, onNavigate }: { items: readonly WorkspaceNavigationItem[]; activeItem: string; onNavigate: (id: string) => void }) {
  return <aside className="hidden w-[72px] flex-col items-center border-r border-line/70 bg-[#f8f9fb] py-5 lg:flex"><div className="grid w-10 gap-2 rounded-[18px] bg-white p-1.5 shadow-[0_2px_8px_rgba(34,42,57,.04)]"><span aria-label="Modo claro" className="grid h-7 w-7 place-items-center rounded-lg bg-surface-subtle text-[13px] text-ink/60">☼</span><span aria-label="Modo escuro" className="grid h-7 w-7 place-items-center rounded-lg text-[13px] text-ink/42">☾</span></div><nav className="mt-16 grid gap-2" aria-label="Atalhos do painel">{items.map((item) => <button key={item.id} aria-label={item.label} aria-current={activeItem === item.id ? "page" : undefined} title={item.label} onClick={() => onNavigate(item.id)} className={`grid h-10 w-10 place-items-center rounded-[14px] transition ${activeItem === item.id ? "bg-brand text-white shadow-[0_6px_15px_rgba(238,77,45,.2)]" : "text-ink/52 hover:bg-white hover:text-ink"}`}><Icon name={item.icon} /></button>)}</nav><div className="mt-auto grid gap-2"><span aria-label="Ajuda" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink/48 shadow-[0_2px_7px_rgba(34,42,57,.035)]"><Icon name="help" /></span><span aria-label="Configurações" className="grid h-9 w-9 place-items-center rounded-xl bg-white text-ink/48 shadow-[0_2px_7px_rgba(34,42,57,.035)]"><Icon name="settings" /></span></div></aside>;
}

export function WorkspaceShell({ items, activeItem, onNavigate, toolbar, children }: { items: readonly WorkspaceNavigationItem[]; activeItem: string; onNavigate: (id: string) => void; toolbar: ReactNode; children: ReactNode }) {
  return <AppFrame className="p-0 lg:p-3"><div className="min-h-screen bg-[#f7f8fa] lg:flex lg:min-h-[calc(100vh-1.5rem)] lg:overflow-hidden lg:rounded-[30px] lg:border lg:border-white lg:shadow-[0_18px_50px_rgba(29,36,50,.08)]"><WorkspaceRail items={items} activeItem={activeItem} onNavigate={onNavigate} /><main className="min-w-0 flex-1"><header className="flex min-h-[76px] items-center gap-3 border-b border-line/70 bg-[#f7f8fa]/90 px-4 backdrop-blur sm:px-6 lg:px-8"><BrandLockup size="sm" /><div className="hidden min-w-0 flex-1 xl:block"><WorkspaceNavigation items={items} activeItem={activeItem} onNavigate={onNavigate} /></div><div className="ml-auto flex items-center gap-2">{toolbar}</div></header><div className="border-b border-line/70 bg-white px-3 py-2 xl:hidden"><WorkspaceNavigation items={items} activeItem={activeItem} onNavigate={onNavigate} /></div>{children}</main></div></AppFrame>;
}

export function WorkspaceLoading() {
  return <main className="grid min-h-screen grid-cols-[4.5rem_1fr] bg-mist p-3"><Skeleton className="rounded-[28px]" /><div className="ml-3 grid gap-5"><Skeleton className="h-[74px] rounded-[28px]" /><div className="grid grid-cols-4 gap-3"><LoadingCard /><LoadingCard /><LoadingCard /><LoadingCard /></div><TableSkeleton rows={6} columns={5} /></div></main>;
}
