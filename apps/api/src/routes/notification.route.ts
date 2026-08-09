import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { NotificationSchema } from "@knot/shared"
import * as notificationService from "../services/notification.service.js"

const listNotificationsRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(NotificationSchema),
        },
      },
      description: "List current user's notifications",
    },
  },
})

const markAllReadRoute = createRoute({
  method: "post",
  path: "/read",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(NotificationSchema),
        },
      },
      description: "Mark all notifications as read",
    },
  },
})

const notificationRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

notificationRoutes.openapi(listNotificationsRoute, async (c) => {
  return c.json(await notificationService.list(c.get("userId")))
})

notificationRoutes.openapi(markAllReadRoute, async (c) => {
  return c.json(await notificationService.markAllRead(c.get("userId")))
})

export default notificationRoutes
