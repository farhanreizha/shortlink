import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"
import type { ContentfulStatusCode } from "hono/utils/http-status"

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status as ContentfulStatusCode)
  }
  console.error(err)
  return c.json({ message: "Internal server error" }, 500)
}
