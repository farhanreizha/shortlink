import { serve } from "@hono/node-server"
import app from "./app.js"
import { env } from "./config.js"

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API running on :${info.port}`)
})

export default app
