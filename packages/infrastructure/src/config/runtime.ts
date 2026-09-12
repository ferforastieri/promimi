import "dotenv/config";
import { env } from "node:process";

/** The sole boundary allowed to read the process environment. */
export type RuntimeEnvironment = NodeJS.ProcessEnv;
export const runtimeEnvironment: RuntimeEnvironment = env;
