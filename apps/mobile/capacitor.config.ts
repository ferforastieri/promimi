import type { CapacitorConfig } from "@capacitor/cli";

const siteUrl = process.env.PROMIMI_MOBILE_SITE_URL;

const config: CapacitorConfig = {
  appId: "com.promimi.app",
  appName: "Promimi",
  webDir: "www",
  android: {
    allowMixedContent: false,
    webContentsDebuggingEnabled: false,
  },
  ...(siteUrl
    ? {
        server: {
          url: siteUrl,
          cleartext: false,
        },
      }
    : {}),
};

export default config;
