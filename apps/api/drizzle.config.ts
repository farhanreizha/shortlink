import { defineConfig } from "drizzle-kit"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://shortlink:shortlink@localhost:5432/shortlink",
  },
})
