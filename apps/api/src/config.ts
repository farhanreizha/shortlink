import { z } from "zod"

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  DATABASE_URL: z
    .string()
    .default("postgres://shortlink:shortlink@localhost:5432/shortlink"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("*"),
  APP_URL: z.string().default("http://localhost:5173"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  // z.coerce.boolean() is Boolean(input), so "false" → true. stringbool parses
  // the string properly: port 587 needs secure:false (STARTTLS), 465 needs true.
  SMTP_SECURE: z.stringbool().default(false),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("noreply@knot.dev"),
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
