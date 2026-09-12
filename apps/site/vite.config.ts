import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { loadFrontendConfig } from "@promimi/infrastructure/config/frontend";

const { DEV_API_URL: apiTarget } = loadFrontendConfig();

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: { proxy: { "/api": apiTarget } },
});
