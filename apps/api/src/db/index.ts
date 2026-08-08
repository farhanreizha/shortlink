import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import { env } from "../config.js"
import * as schema from "./schema.js"

// ponytail: single connection in tests — serializes fire-and-forget inserts with TRUNCATE, kills deadlocks
const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: env.NODE_ENV === "test" ? 1 : 10,
})

export const db = drizzle(pool, { schema })
export { pool }
