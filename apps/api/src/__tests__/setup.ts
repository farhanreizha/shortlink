import { migrate } from "drizzle-orm/node-postgres/migrator"
import { afterAll, beforeAll } from "vitest"
import { db, pool } from "../db/index.js"

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./migrations" })
})

afterAll(async () => {
  await pool.end()
})
