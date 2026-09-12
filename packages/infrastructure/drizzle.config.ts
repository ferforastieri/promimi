import { defineConfig } from "drizzle-kit";
import { runtimeEnvironment } from "./src/config/runtime.js";

const databaseUrl = runtimeEnvironment.DATABASE_URL ?? "postgresql://promimi:promimi@localhost:5432/promimi";
export default defineConfig({
  schema: "./src/database/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: databaseUrl },
});
