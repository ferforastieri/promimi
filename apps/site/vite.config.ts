import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { loadFrontendConfig } from "@promimi/infrastructure/config/frontend";
import { localApiProxy } from "../../infra/vite-proxy";

const { API_URL, PUBLIC_API_URL } = loadFrontendConfig();
const apiTarget = PUBLIC_API_URL ?? API_URL;

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  server: { proxy: { "/api": localApiProxy(apiTarget) } },
});
