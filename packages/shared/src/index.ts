import { z } from "zod"

const PasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Password must contain a lowercase letter")
  .regex(/[A-Z]/, "Password must contain an uppercase letter")
  .regex(/[0-9]/, "Password must contain a number")

export const RegisterSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(20)
    .regex(
      /^[a-zA-Z0-9_.-]+$/,
      "Username may only contain letters, numbers, dots, underscores and hyphens",
    ),
  email: z.string().email(),
  password: PasswordSchema,
  ref: z.string().optional(),
})

export type RegisterInput = z.infer<typeof RegisterSchema>

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export type LoginInput = z.infer<typeof LoginSchema>

export const NotificationPrefsSchema = z.object({
  email: z.object({
    linkClicks: z.boolean(),
    campaignReports: z.boolean(),
    accountUpdates: z.boolean(),
  }),
  push: z.object({
    mobileAlerts: z.boolean(),
  }),
})

export type NotificationPrefs = z.infer<typeof NotificationPrefsSchema>

export const UserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  notificationPrefs: NotificationPrefsSchema,
  createdAt: z.string().datetime(),
})

export type User = z.infer<typeof UserSchema>

export const ShortlinkSchema = z.object({
  id: z.string(),
  slug: z.string(),
  url: z.string().url(),
  visits: z.number(),
  campaignId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Shortlink = z.infer<typeof ShortlinkSchema>

const SlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    "Slug may only contain letters, numbers, underscores and hyphens",
  )

const HttpUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    try {
      const protocol = new URL(value).protocol
      return protocol === "http:" || protocol === "https:"
    } catch {
      return false
    }
  }, "URL must use the http or https scheme")

export const CreateShortlinkSchema = z.object({
  slug: SlugSchema,
  url: HttpUrlSchema,
  campaignId: z.coerce.number().int().nullable().optional(),
})

export type CreateShortlink = z.infer<typeof CreateShortlinkSchema>

export const UpdateShortlinkSchema = z.object({
  slug: SlugSchema.optional(),
  url: HttpUrlSchema.optional(),
  campaignId: z.coerce.number().int().nullable().optional(),
})

export type UpdateShortlink = z.infer<typeof UpdateShortlinkSchema>

export const ShortlinkQuerySchema = z.object({
  offset: z.coerce.number().int().min(0).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  q: z.string().optional(),
  sortBy: z.enum(["createdAt", "visits"]).default("createdAt"),
  campaignId: z.coerce.number().int().optional(),
})

export type ShortlinkQuery = z.infer<typeof ShortlinkQuerySchema>

export const CampaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["active", "archived"]),
  createdAt: z.string().datetime(),
})

export type Campaign = z.infer<typeof CampaignSchema>

export const CampaignSummarySchema = CampaignSchema.extend({
  linksCount: z.number(),
  clicks: z.number(),
})

export type CampaignSummary = z.infer<typeof CampaignSummarySchema>

export const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
})

export type CreateCampaign = z.infer<typeof CreateCampaignSchema>

export const UpdateCampaignSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "archived"]).optional(),
})

export type UpdateCampaign = z.infer<typeof UpdateCampaignSchema>

export const CampaignQuerySchema = z.object({
  status: z.enum(["active", "archived"]).optional(),
  q: z.string().optional(),
})

export type CampaignQuery = z.infer<typeof CampaignQuerySchema>

export const AnalyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "month", "custom"]).default("7d"),
  bucket: z.enum(["daily", "weekly"]).default("daily"),
  start: z.string().optional(),
  end: z.string().optional(),
})

export type AnalyticsQuery = z.infer<typeof AnalyticsQuerySchema>

export const AnalyticsOverviewSchema = z.object({
  totalClicks: z.number(),
  uniqueVisitors: z.number(),
  topReferral: z.string(),
  avgCtr: z.number().nullable(),
  clicksByDevice: z.object({
    mobile: z.number(),
    desktop: z.number(),
    tablet: z.number(),
  }),
  clicksByLocation: z.array(
    z.object({ country: z.string(), count: z.number(), pct: z.number() }),
  ),
  clicksOverTime: z.array(z.object({ date: z.string(), count: z.number() })),
  topLinks: z.array(
    z.object({
      id: z.string(),
      slug: z.string(),
      url: z.string(),
      clicks: z.number(),
      unique: z.number(),
    }),
  ),
})

export type AnalyticsOverview = z.infer<typeof AnalyticsOverviewSchema>

export const UpdateUserSchema = z.object({
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: PasswordSchema.optional(),
  notificationPrefs: NotificationPrefsSchema.optional(),
})

export type UpdateUser = z.infer<typeof UpdateUserSchema>

export const NotificationSchema = z.object({
  id: z.string(),
  type: z.enum(["welcome", "new_feature", "referral"]),
  read: z.boolean(),
  data: z.object({ username: z.string() }).optional(),
  createdAt: z.string().datetime(),
})

export type Notification = z.infer<typeof NotificationSchema>
export type NotificationType = Notification["type"]

export const ReferralUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  createdAt: z.string().datetime(),
  rewarded: z.boolean(),
})

export type ReferralUser = z.infer<typeof ReferralUserSchema>

export const ReferralSchema = z.object({
  code: z.string(),
  proUntil: z.string().datetime().nullable(),
  stats: z.object({
    referred: z.number(),
    rewarded: z.number(),
    proMonths: z.number(),
  }),
  referredUsers: z.array(ReferralUserSchema),
})

export type Referral = z.infer<typeof ReferralSchema>
