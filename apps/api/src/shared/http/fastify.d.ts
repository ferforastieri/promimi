import "@fastify/jwt";
import type { ApiConfig } from "@promimi/infrastructure/config";

declare module "fastify" {
  interface FastifyInstance {
    promimiConfig: ApiConfig;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: { id: string; role: "ADMIN" | "EDITOR" | "VISITOR"; email: string };
  }
}
