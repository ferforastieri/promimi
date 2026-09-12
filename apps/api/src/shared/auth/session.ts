import type { FastifyInstance, FastifyReply } from "fastify";

export const sessionCookie = "promimi_session";
const sessionLifetimeSeconds = 60 * 60 * 8;
type SessionUser = {
  id: string;
  role: "ADMIN" | "EDITOR" | "VISITOR";
  email: string;
};
const cookieOptions = (secure: boolean) => ({
  httpOnly: true,
  secure,
  sameSite: "lax" as const,
  path: "/",
  maxAge: sessionLifetimeSeconds,
});
export function establishSession(
  app: FastifyInstance,
  reply: FastifyReply,
  user: SessionUser,
) {
  reply.setCookie(
    sessionCookie,
    app.jwt.sign(user, { expiresIn: sessionLifetimeSeconds } as never),
    cookieOptions(app.promimiConfig.NODE_ENV !== "development"),
  );
}
export function clearSession(app: FastifyInstance, reply: FastifyReply) {
  reply.clearCookie(sessionCookie, {
    path: "/",
    httpOnly: true,
    secure: app.promimiConfig.NODE_ENV !== "development",
    sameSite: "lax",
  });
}
