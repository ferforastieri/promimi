import { environmentSchema } from "./environment.js";
export const loadWorkerConfig = (env = process.env) => environmentSchema.parse(env);
