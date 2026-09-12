import { Form, Link } from "react-router";
import { BrandMark } from "@promimi/design-system";
import type { Offer } from "../catalog/types";
import { brl } from "../catalog/server";

const visualTones: Record<string, string> = { casa: "bg-[#fff0e6]", esporte: "bg-[#e5f4ee]", tecnologia: "bg-[#edf0ff]", audio: "bg-[#f4edff]" };
const brandName = <span className="inline-flex items-baseline"><span>pro</span><b className="font-bold">mimi</b><i className="ml-px not-italic text-brand">•</i></span>;

export function Header() {
  return <header className="mx-auto flex h-[88px] max-w-[1600px] items-center gap-5 px-4 sm:px-6 lg:px-8">
    <Link to="/" className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap text-[30px] leading-none tracking-[-0.1em]" aria-label="Promimi, início"><BrandMark className="h-12 w-12" label="" />{brandName}</Link>
    <Form action="/buscar" className="ml-auto hidden w-[min(390px,40vw)] items-center border-b border-[#b9b5ac] md:flex"><input className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-[#868279]" name="q" placeholder="O que você quer encontrar?" /><button className="cursor-pointer border-0 bg-transparent text-[26px] leading-none" aria-label="Buscar">⌕</button></Form>
    <nav className="ml-auto flex items-center gap-5 whitespace-nowrap text-[13px] font-bold md:ml-0"><Link className="hidden md:block" to="/buscar">Explorar</Link><Link className="hidden md:block" to="/conta">Minha conta</Link><Link to="/entrar" className="rounded-md border border-ink px-3 py-2 transition hover:bg-ink hover:text-white">Entrar</Link></nav>
  </header>;
}

export function Footer() {
  return <footer className="mx-auto grid max-w-[1600px] grid-cols-2 gap-8 px-4 py-14 text-xs sm:px-6 md:grid-cols-[2fr_1fr_1fr] lg:px-8">
    <div className="col-span-2 md:col-span-1"><span className="inline-flex items-center gap-2 text-[25px] leading-none tracking-[-0.1em]"><BrandMark className="h-9 w-9" label="" />{brandName}</span><p className="mt-4 max-w-[260px] leading-6 text-ink/60">Oferta boa é aquela que ainda existe quando você chega.</p></div>
    <div className="flex flex-col gap-2.5 text-ink/65"><strong className="mb-1 text-ink">Promimi</strong><Link to="/buscar">Ofertas</Link><Link to="/entrar">Minha conta</Link></div>
    <div className="flex flex-col gap-2.5 text-ink/65"><strong className="mb-1 text-ink">Transparência</strong><Link to="/privacidade">Privacidade</Link><Link to="/termos">Termos de uso</Link><Link to="/cookies">Cookies</Link><a href="https://github.com/ferforastieri/promimi" target="_blank" rel="noreferrer">Código-fonte</a></div>
    <p className="col-span-2 border-t border-line pt-6 leading-6 text-ink/60 md:col-span-3">Alguns links podem render comissão, sem custo adicional para você.</p>
  </footer>;
}

export function OfferCard({ offer, featured = false }: { offer: Offer; featured?: boolean }) {
  const tone = visualTones[offer.category?.slug ?? ""] ?? "bg-[#edf3ff]";
  return <article className={`group min-w-0 overflow-hidden rounded-xl border border-line bg-white shadow-[0_2px_0_rgba(32,32,30,.02)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(45,37,25,.1)] ${featured ? "md:grid md:grid-cols-[1.2fr_1fr]" : ""}`}>
    <div className={`relative min-h-[183px] overflow-hidden p-4 ${tone} ${featured ? "md:min-h-[355px]" : ""}`}><span className="relative z-10 rounded bg-white px-2 py-1 font-mono text-[10px]">{offer.category?.name ?? "Oferta"}</span><div className="absolute bottom-[9%] right-[16%] h-40 w-40 rotate-[-13deg] rounded-[36px] border-[15px] border-white/60 shadow-[inset_0_0_0_17px_rgba(20,25,40,.08)]" aria-hidden="true" /></div>
    <div className="p-[18px]"><div className="flex justify-between font-mono text-[10px] text-ink/60"><span>{offer.store.name}</span>{offer.discountPercent && <b className="text-danger">-{offer.discountPercent}%</b>}</div><h3 className="my-3 min-h-[43px] text-[15px] leading-[1.38] tracking-[-.02em]"><Link to={`/oferta/${offer.slug}`}>{offer.title}</Link></h3><div className="flex items-baseline gap-2">{offer.originalPrice && <del className="text-xs text-ink/50">{brl(offer.originalPrice)}</del>}<strong className="text-[21px] tracking-[-.05em]">{brl(offer.currentPrice)}</strong></div>{offer.couponCode ? <div className="mt-3.5 flex items-center gap-2 rounded border border-dashed border-[#f09c77] bg-[#fff1e9] px-2 py-1.5 text-[#b94a1b]"><small className="font-mono text-[8px]">CUPOM</small><code className="text-[11px] font-extrabold">{offer.couponCode}</code></div> : <span className="mt-3.5 block h-[31px] text-[10px] font-bold text-pine">✓ preço verificado agora</span>}<Link className="mt-3 flex justify-between border-t border-line pt-3 text-xs font-bold" to={`/oferta/${offer.slug}`}>Ver oferta <span className="text-brand">→</span></Link></div>
  </article>;
}
