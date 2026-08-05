import {
  index,
  integer,
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const shortlinks = pgTable(
  "shortlinks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    slug: text("slug").notNull().unique(),
    url: text("url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    visits: integer("visits").notNull().default(0),
  },
  (table) => ({
    userIdIdx: index("shortlinks_user_id_idx").on(table.userId),
  }),
)
