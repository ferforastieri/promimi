import type { FastifyPluginAsync } from "fastify";
import { automationController } from "./automation.controller.js";

const automationPlugin: FastifyPluginAsync = async (app) =>
  app.register(automationController);
export default automationPlugin;
