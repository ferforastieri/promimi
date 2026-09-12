import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadAdminConfig } from "@promimi/infrastructure/config/admin";
import { loadFrontendConfig } from "@promimi/infrastructure/config/frontend";

const { ADMIN_PREVIEW_ALLOWED_HOSTS: allowedHosts } = loadAdminConfig();
const { DEV_API_URL: apiTarget } = loadFrontendConfig();

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 5173, proxy: { "/api": apiTarget } },
  preview: { allowedHosts },
});
