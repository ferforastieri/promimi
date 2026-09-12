import { config as loadDotenv } from "dotenv";
import { dirname, resolve } from "node:path";
import { env } from "node:process";
import { fileURLToPath } from "node:url";

loadDotenv({
  path: resolve(dirname(fileURLToPath(import.meta.url)), "../../../../.env"),
});

/** The sole boundary allowed to read the process environment. */
export type RuntimeEnvironment = NodeJS.ProcessEnv;
export const runtimeEnvironment: RuntimeEnvironment = env;
