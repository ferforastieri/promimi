import { useEffect } from "react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { PromimiQueryProvider } from "@promimi/query";
import { AppFrame, ToastProvider } from "@promimi/design-system";
import "./tailwind.css";

export const links = () => [
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "icon", type: "image/png", sizes: "32x32", href: "/brand/favicon-32.png" },
  { rel: "icon", type: "image/png", sizes: "48x48", href: "/brand/favicon-48.png" },
  { rel: "apple-touch-icon", sizes: "192x192", href: "/brand/icon-192.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap",
  },
];
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ee4d2d" />
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
      <ToastProvider>
        <AppFrame><Outlet /></AppFrame>
      </ToastProvider>
    </PromimiQueryProvider>
  );
}
