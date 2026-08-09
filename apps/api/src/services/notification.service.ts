import type { Notification } from "@knot/shared"
import { desc, eq } from "drizzle-orm"
import { db } from "../db/index.js"
import { notifications } from "../db/schema.js"

const SEED_TYPES = ["welcome", "new_feature"] as const

function toNotification(row: typeof notifications.$inferSelect): Notification {
  return {
    id: String(row.id),
    type: row.type,
    read: row.read,
    ...(row.data ? { data: row.data } : {}),
    createdAt: row.createdAt.toISOString(),
  }
}

// ponytail: seeds once per user on first fetch (covers existing users);
// event-driven notifications (click milestones, etc.) come later
async function ensureSeeded(userId: number) {
  const [row] = await db
    .select({ count: notifications.id })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .limit(1)
  if (row && row.count > 0) return

  await db
    .insert(notifications)
    .values(SEED_TYPES.map((type) => ({ userId, type, read: false })))
}

export async function list(userId: number): Promise<Notification[]> {
  await ensureSeeded(userId)
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
  return rows.map(toNotification)
}

export async function markAllRead(userId: number): Promise<Notification[]> {
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.userId, userId))
  return list(userId)
}
