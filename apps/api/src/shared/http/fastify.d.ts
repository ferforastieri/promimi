import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: { id: string; role: "ADMIN" | "EDITOR" | "VISITOR"; email: string };
  }
}
