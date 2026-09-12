import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { loadDatabaseConfig } from "../config/database.js";
import * as schema from "./schema/index.js";

export const pool = new Pool({
  connectionString: loadDatabaseConfig().DATABASE_URL,
});
export const db = drizzle(pool, { schema });
