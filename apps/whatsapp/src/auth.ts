import type { FastifyRequest } from "fastify";

export function authorizeBridge(
  request: FastifyRequest,
  token: string | undefined,
) {
  return Boolean(token && request.headers.authorization === `Bearer ${token}`);
}
