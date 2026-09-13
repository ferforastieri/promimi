import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadAdminConfig } from "@promimi/infrastructure/config/admin";
import { loadFrontendConfig } from "@promimi/infrastructure/config/frontend";
import { localApiProxy } from "../../infra/vite-proxy";

const { ADMIN_PREVIEW_ALLOWED_HOSTS: allowedHosts } = loadAdminConfig();
const { API_URL, PUBLIC_API_URL } = loadFrontendConfig();
const apiTarget = PUBLIC_API_URL ?? API_URL;

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 5173, proxy: { "/api": localApiProxy(apiTarget) } },
  preview: { allowedHosts },
});
