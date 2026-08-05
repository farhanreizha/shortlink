import { OpenAPIHono } from "@hono/zod-openapi"
import { cors } from "hono/cors"
import { env } from "./config"
import { rateLimit } from "./lib/rate-limiter"
import { authMiddleware } from "./middleware/auth"
import { errorHandler } from "./middleware/error-handler"
import authRoutes from "./routes/auth.route"
import healthRoutes from "./routes/health.route"
import redirectRoutes from "./routes/redirect.route"
import shortlinkRoutes from "./routes/shortlink.route"

const app = new OpenAPIHono<{ Variables: { userId: number } }>()

app.onError(errorHandler)

const origin =
  env.CORS_ORIGIN === "*"
    ? "*"
    : env.CORS_ORIGIN.split(",").map((s) => s.trim())
app.use("/api/*", cors({ origin, credentials: true }))

app.route("/api", healthRoutes)

app.use("/api/auth/register", rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }))

app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }))

app.use("/api/shortlinks", rateLimit({ windowMs: 60 * 1000, max: 30 }))

app.use("/api/*", authMiddleware)

app.route("/api/auth", authRoutes)
app.route("/api/shortlinks", shortlinkRoutes)
app.route("/r", redirectRoutes)

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    title: "Shortlink API",
    version: "1.0.0",
  },
})

export default app
