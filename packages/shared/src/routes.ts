import type {
  AnalyticsOverview,
  AnalyticsQuery,
  Campaign,
  CampaignQuery,
  CampaignSummary,
  CreateCampaign,
  CreateShortlink,
  DeleteAccount,
  ForgotPasswordInput,
  LoginInput,
  MeResult,
  Notification,
  Referral,
  RegisterInput,
  RegisterResult,
  ResetPasswordInput,
  Shortlink,
  ShortlinkQuery,
  UpdateCampaign,
  UpdateShortlink,
  UpdateUser,
  User,
} from "./index.js"

export type AppRoutes = {
  "/api/auth/register": {
    $post: {
      input: { json: RegisterInput }
      output: RegisterResult
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
  "/api/auth/forgot-password": {
    $post: {
      input: { json: ForgotPasswordInput }
      output: { message: string; resetUrl?: string }
      outputFormat: "json"
      status: 200
    }
  }
  "/api/auth/reset-password": {
    $post: {
      input: { json: ResetPasswordInput }
      output: { message: string }
      outputFormat: "json"
      status: 200
    }
  }
  "/api/auth/me": {
    $get: {
      // biome-ignore lint/complexity/noBannedTypes: Hono RPC input type
      input: {}
      output: MeResult
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
      input: { json: DeleteAccount }
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
  "/api/analytics/overview": {
    $get: {
      input: { query: AnalyticsQuery }
      output: AnalyticsOverview
      outputFormat: "json"
      status: 200
    }
  }
  "/api/notifications": {
    $get: {
      // biome-ignore lint/complexity/noBannedTypes: Hono RPC input type
      input: {}
      output: Notification[]
      outputFormat: "json"
      status: 200
    }
  }
  "/api/notifications/read": {
    $post: {
      // biome-ignore lint/complexity/noBannedTypes: Hono RPC input type
      input: {}
      output: Notification[]
      outputFormat: "json"
      status: 200
    }
  }
  "/api/referral": {
    $get: {
      // biome-ignore lint/complexity/noBannedTypes: Hono RPC input type
      input: {}
      output: Referral
      outputFormat: "json"
      status: 200
    }
  }
  "/api/campaigns": {
    $get: {
      input: { query: CampaignQuery }
      output: CampaignSummary[]
      outputFormat: "json"
      status: 200
    }
    $post: {
      input: { json: CreateCampaign }
      output: Campaign
      outputFormat: "json"
      status: 201
    }
  }
  "/api/campaigns/:id": {
    $patch: {
      input: { param: { id: string }; json: UpdateCampaign }
      output: Campaign
      outputFormat: "json"
      status: 200
    }
    $delete: {
      input: { param: { id: string } }
      output: { message: string }
      outputFormat: "json"
      status: 200
    }
  }
}
