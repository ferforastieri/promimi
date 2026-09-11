import type { FastifyPluginAsync } from "fastify";
import { communityController } from "./community.controller.js";

const communityPlugin: FastifyPluginAsync = async (app) => app.register(communityController);
export default communityPlugin;
