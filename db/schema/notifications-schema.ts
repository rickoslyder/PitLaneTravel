import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const notificationTypeEnum = pgEnum("notification_type", [
  "ticket_available",
  "price_change",
  "package_available"
])

export const notificationStatusEnum = pgEnum("notification_status", [
  "pending",
  "sent",
  "failed",
  "cancelled"
])

export const notificationsTable = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  status: notificationStatusEnum("status").default("pending").notNull(),
  metadata: text("metadata"),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertNotification = typeof notificationsTable.$inferInsert
export type SelectNotification = typeof notificationsTable.$inferSelect
