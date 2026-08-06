import type {
  CreateShortlink,
  LoginInput,
  RegisterInput,
  Shortlink,
  ShortlinkQuery,
  UpdateShortlink,
  UpdateUser,
  User,
} from "./index.js"

export type AppRoutes = {
  "/api/auth/register": {
    $post: {
      input: { json: RegisterInput }
      output: User
      outputFormat: "json"
      status: 201
    }
  }
  "/api/auth/login": {
    $post: {
      input: { json: LoginInput }
      output: User
      outputFormat: "json"
      status: 201
    }
  }
  "/api/auth/logout": {
    $post: {
      // biome-ignore lint/complexity/noBannedTypes: Hono RPC input type
      input: {}
      output: { message: string }
      outputFormat: "json"
      status: 200
    }
  }
  "/api/auth/me": {
    $get: {
      // biome-ignore lint/complexity/noBannedTypes: Hono RPC input type
      input: {}
      output: User
      outputFormat: "json"
      status: 200
    }
    $patch: {
      input: { json: UpdateUser }
      output: User
      outputFormat: "json"
      status: 200
    }
    $delete: {
      // biome-ignore lint/complexity/noBannedTypes: Hono RPC input type
      input: {}
      output: { message: string }
      outputFormat: "json"
      status: 200
    }
  }
  "/api/shortlinks": {
    $get: {
      input: { query: ShortlinkQuery }
      output: Shortlink[]
      outputFormat: "json"
      status: 200
    }
    $post: {
      input: { json: CreateShortlink }
      output: Shortlink
      outputFormat: "json"
      status: 201
    }
  }
  "/api/shortlinks/:slug": {
    $get: {
      input: { param: { slug: string } }
      output: Shortlink
      outputFormat: "json"
      status: 200
    }
    $delete: {
      input: { param: { slug: string } }
      output: Shortlink
      outputFormat: "json"
      status: 200
    }
    $patch: {
      input: { param: { slug: string }; json: UpdateShortlink }
      output: Shortlink
      outputFormat: "json"
      status: 200
    }
  }
}
