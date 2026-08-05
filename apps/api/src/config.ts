import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z
    .string()
    .default("postgres://shortlink:shortlink@localhost:5432/shortlink"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("*"),
})

export const env = (() => {
  const parsed = envSchema.parse(process.env)
  if (
    parsed.JWT_SECRET === "dev-secret-change-in-production" &&
    parsed.NODE_ENV === "production"
  ) {
    throw new Error(
      "JWT_SECRET must be changed from the default value in production",
    )
  }
  return parsed
})()
