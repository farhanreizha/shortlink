import { sql } from "drizzle-orm"
import {
  boolean,
  foreignKey,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core"

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    username: text("username").notNull().unique(),
    email: text("email").notNull().unique(),
    password: text("password").notNull(),
    notificationPrefs: jsonb("notification_prefs")
      .$type<{
        email: {
          linkClicks: boolean
          campaignReports: boolean
          accountUpdates: boolean
        }
        push: { mobileAlerts: boolean }
      }>()
      .notNull()
      .default({
        email: {
          linkClicks: true,
          campaignReports: true,
          accountUpdates: true,
        },
        push: { mobileAlerts: true },
      }),
    referralCode: text("referral_code"),
    referrerId: integer("referrer_id"),
    proUntil: timestamp("pro_until"),
    referralRewarded: boolean("referral_rewarded").notNull().default(false),
    resetTokenHash: text("reset_token_hash"),
    resetTokenExpiresAt: timestamp("reset_token_expires_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    referralCodeIdx: uniqueIndex("users_referral_code_idx").on(
      table.referralCode,
    ),
    referrerIdFk: foreignKey({
      columns: [table.referrerId],
      foreignColumns: [table.id],
    }).onDelete("set null"),
  }),
)

export const campaigns = pgTable(
  "campaigns",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    status: text("status", { enum: ["active", "archived"] })
      .notNull()
      .default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("campaigns_user_id_idx").on(table.userId),
  }),
)

export const shortlinks = pgTable(
  "shortlinks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    slug: text("slug").notNull().unique(),
    url: text("url").notNull(),
    campaignId: integer("campaign_id").references(() => campaigns.id, {
      onDelete: "set null",
    }),
    expiresAt: timestamp("expires_at"),
    password: text("password"),
    title: text("title"),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    visits: integer("visits").notNull().default(0),
  },
  (table) => ({
    userIdIdx: index("shortlinks_user_id_idx").on(table.userId),
    campaignIdIdx: index("shortlinks_campaign_id_idx").on(table.campaignId),
  }),
)

export const clicks = pgTable(
  "clicks",
  {
    id: serial("id").primaryKey(),
    shortlinkId: integer("shortlink_id")
      .notNull()
      .references(() => shortlinks.id, { onDelete: "cascade" }),
    device: text("device", { enum: ["mobile", "desktop", "tablet"] }).notNull(),
    country: text("country").notNull().default("Unknown"),
    referrer: text("referrer").notNull().default(""),
    visitor: text("visitor").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    shortlinkIdIdx: index("clicks_shortlink_id_idx").on(table.shortlinkId),
    createdAtIdx: index("clicks_created_at_idx").on(table.createdAt),
  }),
)

export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", {
      enum: ["welcome", "new_feature", "referral"],
    }).notNull(),
    read: boolean("read").notNull().default(false),
    data: jsonb("data").$type<{ username: string }>(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("notifications_user_id_idx").on(table.userId),
    // Prevent duplicate seed notifications (welcome, new_feature) per user;
    // referral notifications are allowed once per invitee (partial index)
    seedTypeUnique: uniqueIndex("notifications_user_seed_type_idx")
      .on(table.userId, table.type)
      .where(sql`${table.type} IN ('welcome', 'new_feature')`),
  }),
)

export const rateLimits = pgTable(
  "rate_limits",
  {
    key: text("key").primaryKey(),
    count: integer("count").notNull().default(1),
    resetAt: timestamp("reset_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    resetAtIdx: index("rate_limits_reset_at_idx").on(table.resetAt),
  }),
)
