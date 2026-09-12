import type { CapacitorConfig } from "@capacitor/cli";
import { loadMobileConfig } from "@promimi/infrastructure/config/mobile";

const { PROMIMI_MOBILE_SITE_URL: siteUrl } = loadMobileConfig();

const config: CapacitorConfig = {
  appId: "com.promimi.app",
  appName: "Promimi",
  webDir: "www",
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  ...(siteUrl ? { server: { url: siteUrl, cleartext: false } } : {}),
};

export default config;
