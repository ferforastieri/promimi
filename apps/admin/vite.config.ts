import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { loadAdminConfig } from "@promimi/infrastructure/config/admin";

const { ADMIN_PREVIEW_ALLOWED_HOSTS: allowedHosts } = loadAdminConfig();

export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:3001" } },
  preview: { allowedHosts },
});
