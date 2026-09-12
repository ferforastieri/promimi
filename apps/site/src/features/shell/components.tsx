import { useState } from "react";
import { Form, Link } from "react-router";
import {
  BrandMark,
  Button,
  Card,
  Input,
  Sheet,
  StatusPill,
  TextButton,
} from "@promimi/design-system";
import type { Offer } from "../catalog/types";
import { brl } from "../catalog/server";

const visualTones: Record<string, string> = {
  casa: "bg-[#fff4f0]",
  esporte: "bg-pine-soft",
  tecnologia: "bg-info-soft",
  audio: "bg-[#f4efff]",
};
const brandName = (
  <span className="inline-flex items-baseline">
    <span>pro</span>
    <b>mimi</b>
    <i className="not-italic text-brand">•</i>
  </span>
);

function Brand() {
  return (
    <Link
      to="/"
      className="inline-flex shrink-0 items-center gap-2.5 text-[25px] font-semibold leading-none tracking-[-.09em]"
      aria-label="Promimi, início"
    >
      <BrandMark className="h-9 w-9" label="" />
      {brandName}
    </Link>
  );
}

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Brand />
        <nav className="ml-5 hidden items-center gap-1 rounded-xl bg-mist p-1 md:flex">
          <Link
            className="rounded-lg px-3 py-2 text-xs font-medium text-ink/65 transition hover:bg-white hover:text-ink"
            to="/buscar"
          >
            Explorar
          </Link>
          <Link
            className="rounded-lg px-3 py-2 text-xs font-medium text-ink/65 transition hover:bg-white hover:text-ink"
            to="/conta"
          >
            Minha conta
          </Link>
        </nav>
        <Form
          action="/buscar"
          className="ml-auto hidden w-[min(360px,32vw)] items-center gap-2 rounded-xl border border-line bg-mist px-3 md:flex"
        >
          <span className="text-ink/40">⌕</span>
          <Input
            className="min-h-0 flex-1 border-0 bg-transparent px-0 py-2.5 text-xs shadow-none focus:ring-0"
            name="q"
            placeholder="Buscar ofertas"
          />
          <TextButton className="text-xs text-brand" aria-label="Buscar">
            Buscar
          </TextButton>
        </Form>
        <Link
          to="/entrar"
          className="ml-auto hidden rounded-xl bg-brand px-4 py-2.5 text-xs font-semibold text-white shadow-[0_4px_12px_rgba(238,77,45,.2)] transition hover:bg-brand-dark sm:inline-flex md:ml-0"
        >
          Entrar
        </Link>
        <Button
          variant="subtle"
          size="sm"
          className="ml-auto md:hidden"
          onClick={() => setMenuOpen(true)}
        >
          Menu
        </Button>
      </div>
      <Sheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Navegação"
        description="Encontre ofertas e gerencie sua conta."
      >
        <nav className="grid gap-2">
          <Link
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-mist"
            to="/buscar"
          >
            Explorar ofertas
          </Link>
          <Link
            onClick={() => setMenuOpen(false)}
            className="rounded-xl px-4 py-3 text-sm font-medium hover:bg-mist"
            to="/conta"
          >
            Minha conta
          </Link>
          <Link
            onClick={() => setMenuOpen(false)}
            className="rounded-xl bg-brand px-4 py-3 text-sm font-semibold text-white"
            to="/entrar"
          >
            Entrar
          </Link>
        </nav>
      </Sheet>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-4 py-12 text-xs sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
        <div className="col-span-2 md:col-span-1">
          <span className="inline-flex items-center gap-2 text-[23px] font-semibold leading-none tracking-[-.09em]">
            <BrandMark className="h-8 w-8" label="" />
            {brandName}
          </span>
          <p className="mt-4 max-w-[265px] leading-6 text-ink/55">
            Ofertas boas, apresentadas com clareza para você decidir sem perder
            tempo.
          </p>
        </div>
        <div className="flex flex-col gap-3 text-ink/55">
          <strong className="mb-1 text-ink">Promimi</strong>
          <Link to="/buscar">Ofertas</Link>
          <Link to="/entrar">Minha conta</Link>
        </div>
        <div className="flex flex-col gap-3 text-ink/55">
          <strong className="mb-1 text-ink">Transparência</strong>
          <Link to="/privacidade">Privacidade</Link>
          <Link to="/termos">Termos de uso</Link>
          <Link to="/cookies">Cookies</Link>
        </div>
        <p className="col-span-2 border-t border-line pt-6 leading-6 text-ink/50 md:col-span-3">
          Alguns links podem render comissão, sem custo adicional para você.
        </p>
      </div>
    </footer>
  );
}

export function OfferCard({
  offer,
  featured = false,
}: {
  offer: Offer;
  featured?: boolean;
}) {
  const tone = visualTones[offer.category?.slug ?? ""] ?? "bg-info-soft";
  return (
    <Card
      className={`group min-w-0 overflow-hidden transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(28,35,52,.09)] ${featured ? "md:grid md:grid-cols-[1.06fr_1fr]" : ""}`}
    >
      <div
        className={`relative min-h-[180px] overflow-hidden p-4 ${tone} ${featured ? "md:min-h-[350px]" : ""}`}
      >
        <StatusPill tone="neutral">
          {offer.category?.name ?? "Oferta"}
        </StatusPill>
        <div
          className="absolute bottom-[12%] right-[15%] h-36 w-36 rotate-[-13deg] rounded-[30px] border-[14px] border-white/70 shadow-[inset_0_0_0_14px_rgba(42,49,65,.07)]"
          aria-hidden="true"
        />
      </div>
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-ink/50">
          <span className="font-medium">{offer.store.name}</span>
          {offer.discountPercent && (
            <StatusPill tone="orange">-{offer.discountPercent}%</StatusPill>
          )}
        </div>
        <h3 className="mt-3 min-h-[42px] text-[15px] font-semibold leading-[1.4] tracking-[-.018em]">
          <Link
            className="transition hover:text-brand"
            to={`/oferta/${offer.slug}`}
          >
            {offer.title}
          </Link>
        </h3>
        <div className="mt-4 flex items-baseline gap-2">
          {offer.originalPrice && (
            <del className="text-xs text-ink/42">
              {brl(offer.originalPrice)}
            </del>
          )}
          <strong className="text-[23px] font-semibold tracking-[-.055em]">
            {brl(offer.currentPrice)}
          </strong>
        </div>
        {offer.couponCode ? (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-dashed border-brand/40 bg-brand-soft px-2.5 py-2 text-brand">
            <small className="text-[9px] font-semibold uppercase tracking-wide">
              Cupom
            </small>
            <code className="text-[11px] font-bold">{offer.couponCode}</code>
          </div>
        ) : (
          <span className="mt-4 block text-[11px] font-medium text-pine">
            ● Preço verificado agora
          </span>
        )}
        <Link
          className="mt-4 flex items-center justify-between border-t border-line pt-3.5 text-xs font-semibold text-ink/70 transition hover:text-brand"
          to={`/oferta/${offer.slug}`}
        >
          Ver oferta <span>→</span>
        </Link>
      </div>
    </Card>
  );
}
