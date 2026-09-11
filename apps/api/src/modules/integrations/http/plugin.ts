import type { FastifyPluginAsync } from "fastify";
import { integrationsController } from "./integrations.controller.js";

const integrationsPlugin: FastifyPluginAsync = async (app) => app.register(integrationsController);
export default integrationsPlugin;
