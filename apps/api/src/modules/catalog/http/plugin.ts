import type { FastifyPluginAsync } from "fastify";
import { adminCategoriesController } from "./admin-categories.controller.js";
import { adminOffersController } from "./admin-offers.controller.js";
import { publicCatalogController } from "./public-catalog.controller.js";

/** HTTP entry point for the catalog module, discovered by Fastify autoload. */
const catalogPlugin: FastifyPluginAsync = async (app) => {
  await app.register(publicCatalogController);
  await app.register(adminOffersController);
  await app.register(adminCategoriesController);
};

export default catalogPlugin;
