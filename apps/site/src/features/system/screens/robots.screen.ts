export function loader({ request }: { request: Request }) {
  const origin = new URL(request.url).origin;
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /conta\nDisallow: /entrar\nDisallow: /recuperar-acesso\nSitemap: ${origin}/sitemap.xml\n`,
    { headers: { "content-type": "text/plain" } },
  );
}
