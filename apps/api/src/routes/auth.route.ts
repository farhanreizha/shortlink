import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import {
  LoginSchema,
  RegisterSchema,
  UpdateUserSchema,
  UserSchema,
} from "@knot/shared"
import { deleteCookie, setCookie } from "hono/cookie"
import { ErrorSchema } from "../lib/schemas.js"
import * as authService from "../services/auth.service.js"

const registerRoute = createRoute({
  method: "post",
  path: "/register",
  request: {
    body: {
      content: { "application/json": { schema: RegisterSchema } },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "User registered",
    },
    409: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Email already registered",
    },
  },
})

const loginRoute = createRoute({
  method: "post",
  path: "/login",
  request: {
    body: {
      content: { "application/json": { schema: LoginSchema } },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: UserSchema,
        },
      },
      description: "User logged in",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Invalid credentials",
    },
  },
})

const logoutRoute = createRoute({
  method: "post",
  path: "/logout",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Logged out",
    },
  },
})

const meRoute = createRoute({
  method: "get",
  path: "/me",
  responses: {
    200: {
      content: { "application/json": { schema: UserSchema } },
      description: "Current user",
    },
  },
})

const updateMeRoute = createRoute({
  method: "patch",
  path: "/me",
  request: {
    body: {
      content: { "application/json": { schema: UpdateUserSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: UserSchema } },
      description: "User updated",
    },
  },
})

const deleteMeRoute = createRoute({
  method: "delete",
  path: "/me",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Account deleted",
    },
  },
})

const authRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

authRoutes.openapi(registerRoute, async (c) => {
  const input = c.req.valid("json")
  const { token, user } = await authService.register(input)
  setCookie(c, "token", token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return c.json(user, 201)
})

authRoutes.openapi(loginRoute, async (c) => {
  const input = c.req.valid("json")
  const { token, user } = await authService.login(input)
  setCookie(c, "token", token, {
    httpOnly: true,
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  })
  return c.json(user, 201)
})

authRoutes.openapi(logoutRoute, async (c) => {
  deleteCookie(c, "token", { path: "/" })
  return c.json({ message: "Logged out" })
})

authRoutes.openapi(meRoute, async (c) => {
  const user = await authService.getMe(c.get("userId"))
  return c.json(user)
})

authRoutes.openapi(updateMeRoute, async (c) => {
  const input = c.req.valid("json")
  const user = await authService.updateUser(c.get("userId"), input)
  return c.json(user)
})

authRoutes.openapi(deleteMeRoute, async (c) => {
  await authService.deleteAccount(c.get("userId"))
  deleteCookie(c, "token", { path: "/" })
  return c.json({ message: "Account deleted" })
})

export default authRoutes
