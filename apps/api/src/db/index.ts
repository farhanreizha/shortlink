import { drizzle } from "drizzle-orm/node-postgres"
// import pg from "pg"
import {Pool} from "@neondatabase/serverless"
import { env } from "../config.js"
import * as schema from "./schema.js"

// const pool = new pg.Pool({
//   connectionString: env.DATABASE_URL,
//   max: env.NODE_ENV === "test" ? 5 : 10,
//   ssl: {
//       rejectUnauthorized: true,
//     },
// })

const pool = new Pool({
  connectionString: env.DATABASE_URL,
})

// Idle clients dropped by the server (common on serverless) emit 'error'
// on the pool; without a handler Node crashes on unhandled 'error'.
pool.on("error", (err) => {
  console.error("[db] pool error", err)
})

export const db = drizzle(pool, { schema })
export { pool }
