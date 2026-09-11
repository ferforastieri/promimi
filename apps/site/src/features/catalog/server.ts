import type { Offer } from "./types";

/** Server-side catalog read model. Browser mutations stay in the feature clients. */
export async function loadCatalogOffers(search = ""): Promise<Offer[] | null> {
  try { const response = await fetch(`${process.env.API_URL ?? "http://localhost:3001"}/api/v1/offers${search}`, { signal: AbortSignal.timeout(1300) }); return response.ok ? ((await response.json()) as { data: Offer[] }).data : null; } catch { return null; }
}

export const fallbackOffers: Offer[] = [
  { id:"1", slug:"fone-jbl-tune-520bt", title:"Fone JBL Tune 520BT com bateria de até 57h", store:{id:"amazon",name:"Amazon",slug:"amazon"}, currentPrice:159.90, originalPrice:249.90, discountPercent:36, couponCode:"SOM15", affiliateUrl:"https://amazon.com.br",status:"PUBLISHED",verifiedAt:new Date().toISOString(), category:{name:"Áudio",slug:"audio"} },
  { id:"2", slug:"cafeteira-nespresso-essenza", title:"Cafeteira Nespresso Essenza Mini preta", store:{id:"mercado",name:"Mercado Livre",slug:"mercado-livre"}, currentPrice:299, originalPrice:449, discountPercent:33, affiliateUrl:"https://mercadolivre.com.br",status:"PUBLISHED",verifiedAt:new Date().toISOString(), category:{name:"Casa",slug:"casa"} }
];
export const apiOffers = async (search = "") => (await loadCatalogOffers(search)) ?? fallbackOffers;
export const brl = (number: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(number);
