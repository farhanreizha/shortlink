import type { Context } from "hono"
import { HTTPException } from "hono/http-exception"

export async function errorHandler(err: Error, c: Context) {
  if (err instanceof HTTPException) {
    return c.json({ message: err.message }, err.status)
  }
  console.error(err)
  return c.json({ message: "Internal server error" }, 500)
}
