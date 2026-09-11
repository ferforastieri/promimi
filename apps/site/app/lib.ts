import type { Offer } from "@promimi/contracts";
import { loadCatalogOffers } from "./features/catalog/server";
export const fallbackOffers: Offer[] = [
  { id:"1", slug:"fone-jbl-tune-520bt", title:"Fone JBL Tune 520BT com bateria de até 57h", store:{id:"amazon",name:"Amazon",slug:"amazon"}, currentPrice:159.90, originalPrice:249.90, discountPercent:36, couponCode:"SOM15", affiliateUrl:"https://amazon.com.br",status:"PUBLISHED",verifiedAt:new Date().toISOString(), category:{name:"Áudio",slug:"audio"} },
  { id:"2", slug:"cafeteira-nespresso-essenza", title:"Cafeteira Nespresso Essenza Mini preta", store:{id:"mercado",name:"Mercado Livre",slug:"mercado-livre"}, currentPrice:299.00, originalPrice:449.00, discountPercent:33, affiliateUrl:"https://mercadolivre.com.br",status:"PUBLISHED",verifiedAt:new Date().toISOString(), category:{name:"Casa",slug:"casa"} },
  { id:"3", slug:"tenis-corrida-asics-gel", title:"Tênis de corrida Asics Gel Excite 10", store:{id:"shopee",name:"Shopee",slug:"shopee"}, currentPrice:279.90, originalPrice:399.90, discountPercent:30, couponCode:"CORRE10", affiliateUrl:"https://shopee.com.br",status:"PUBLISHED",verifiedAt:new Date().toISOString(), category:{name:"Esporte",slug:"esporte"} },
  { id:"4", slug:"smart-tv-samsung-50", title:"Smart TV Samsung Crystal UHD 50\" 4K", store:{id:"amazon",name:"Amazon",slug:"amazon"}, currentPrice:2099.00, originalPrice:2699.00, discountPercent:22, affiliateUrl:"https://amazon.com.br",status:"PUBLISHED",verifiedAt:new Date().toISOString(), category:{name:"Tecnologia",slug:"tecnologia"} }
];
export async function apiOffers(search = "") { return (await loadCatalogOffers(search)) ?? fallbackOffers; }
export const brl = (number: number) => new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(number);
