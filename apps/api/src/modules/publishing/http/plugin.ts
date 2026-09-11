import type { FastifyPluginAsync } from "fastify";
import { publishingController } from "./publishing.controller.js";

const publishingPlugin: FastifyPluginAsync = async (app) => app.register(publishingController);
export default publishingPlugin;
