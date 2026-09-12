import type { FastifyInstance } from "fastify";

export function installCsrfOriginGuard(
  app: FastifyInstance,
  allowedOrigins: Set<string>,
) {
  app.addHook("onRequest", async (request, reply) => {
    if (["GET", "HEAD", "OPTIONS"].includes(request.method)) return;
    const createsBrowserSession = /^\/api\/v1\/auth\/(login|register)/.test(
      request.url,
    );
    if (!request.cookies.promimi_session && !createsBrowserSession) return;
    const origin = request.headers.origin;
    if (!origin || !allowedOrigins.has(origin))
      return reply
        .code(403)
        .send({
          error: "CSRF_REJECTED",
          message: "Origem da solicitação não permitida.",
        });
  });
}
