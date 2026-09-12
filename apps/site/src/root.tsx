import { useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { PromimiQueryProvider } from "@promimi/query";
import "./tailwind.css";
import "./tailwind.legacy.css";

export const links = () => [
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "icon", type: "image/png", sizes: "192x192", href: "/brand/icon-192.png" },
  { rel: "icon", type: "image/png", sizes: "512x512", href: "/brand/icon-512.png" },
  { rel: "apple-touch-icon", sizes: "192x192", href: "/brand/icon-192.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap",
  },
];
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#e5484d" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
export default function App() {
  useEffect(() => { if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js"); }, []);
  return (
    <PromimiQueryProvider>
      <Outlet />
    </PromimiQueryProvider>
  );
}
