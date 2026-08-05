import { serve } from "@hono/node-server"
import app from "./app"
import { env } from "./config"

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`API running on :${info.port}`)
})

export default app
