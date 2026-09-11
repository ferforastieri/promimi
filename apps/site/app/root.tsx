import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "@promimi/ui/styles.css";
import "./styles.css";

export const links = () => [{ rel: "preconnect", href: "https://fonts.googleapis.com" }, { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" }, { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Fraunces:opsz,wght@9..144,600;9..144,700&display=swap" }];
export function Layout({ children }: { children: React.ReactNode }) { return <html lang="pt-BR"><head><meta charSet="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><Meta/><Links/></head><body>{children}<ScrollRestoration/><Scripts/></body></html>; }
export default function App() { return <Outlet />; }
