import { environmentSchema } from "./environment.js";
export const loadApiConfig = (env = process.env) => environmentSchema.parse(env);
