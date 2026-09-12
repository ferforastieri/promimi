import { apiOffers } from "../server";
export async function loader({ request }: { request: Request }) {
  const origin = new URL(request.url).origin;
  const offers = await apiOffers(origin);
  const urls = [
    "/",
    "/buscar",
    "/privacidade",
    "/termos",
    ...offers.map((offer) => `/oferta/${offer.slug}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((path) => `<url><loc>${origin}${path}</loc></url>`).join("")}</urlset>`;
  return new Response(body, { headers: { "content-type": "application/xml" } });
}
