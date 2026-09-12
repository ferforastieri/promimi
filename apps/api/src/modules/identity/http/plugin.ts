import type { FastifyPluginAsync } from "fastify";
import { identityController } from "./identity.controller.js";

const identityPlugin: FastifyPluginAsync = async (app) =>
  app.register(identityController);
export default identityPlugin;
