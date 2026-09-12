import type { FastifyPluginAsync } from "fastify";
import { analyticsController } from "./analytics.controller.js";

const analyticsPlugin: FastifyPluginAsync = async (app) =>
  app.register(analyticsController);
export default analyticsPlugin;
