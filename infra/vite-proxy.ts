/**
 * Lets an HTTP Vite server retain the HttpOnly session issued by the public
 * HTTPS API. It is used only by `server.proxy`, never by a production server.
 */
export function localApiProxy(target: string) {
  return {
    target,
    changeOrigin: true,
    configure: (proxy: any) => {
      proxy.on("proxyRes", (response: IncomingMessage) => {
        const cookies = response.headers["set-cookie"];
        if (!cookies) return;
        response.headers["set-cookie"] = (Array.isArray(cookies)
          ? cookies
          : [cookies]
        ).map((value) => value.replace(/;\s*secure\b/gi, ""));
      });
    },
  };
}
import type { IncomingMessage } from "node:http";
