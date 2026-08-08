import { OpenAPIHono } from "@hono/zod-openapi"
import { cors } from "hono/cors"
import { env } from "./config.js"
import { rateLimit } from "./lib/rate-limiter.js"
import { authMiddleware } from "./middleware/auth.js"
import { errorHandler } from "./middleware/error-handler.js"
import analyticsRoutes from "./routes/analytics.route.js"
import authRoutes from "./routes/auth.route.js"
import campaignRoutes from "./routes/campaign.route.js"
import healthRoutes from "./routes/health.route.js"
import redirectRoutes from "./routes/redirect.route.js"
import shortlinkRoutes from "./routes/shortlink.route.js"

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
app.route("/api/analytics", analyticsRoutes)
app.route("/api/campaigns", campaignRoutes)
app.route("/r", redirectRoutes)

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    title: "Shortlink API",
    version: "1.0.0",
  },
})

export default app
