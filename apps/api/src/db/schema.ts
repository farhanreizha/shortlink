import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core"

export const users = pgTable("users", {
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
      email: { linkClicks: true, campaignReports: true, accountUpdates: true },
      push: { mobileAlerts: true },
    }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

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
