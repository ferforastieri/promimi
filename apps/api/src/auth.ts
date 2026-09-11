import type { FastifyRequest } from "fastify";

export async function requireUser(request: FastifyRequest) { await request.jwtVerify(); }
export async function requireStaff(request: FastifyRequest) {
  await request.jwtVerify();
  if (request.user.role !== "ADMIN" && request.user.role !== "EDITOR") {
    throw Object.assign(new Error("Apenas a equipe pode executar esta ação."), { statusCode: 403 });
  }
}
