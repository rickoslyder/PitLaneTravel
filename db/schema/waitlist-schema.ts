import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer
} from "drizzle-orm/pg-core"

export const waitlistStatusEnum = pgEnum("waitlist_status", [
  "pending",
  "notified",
  "purchased",
  "expired",
  "cancelled"
])

export const waitlistTable = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id"),
  raceId: text("race_id").notNull(),
  ticketCategoryId: text("ticket_category_id").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notificationChannel: text("notification_channel").default("email").notNull(),
  status: waitlistStatusEnum("status").default("pending").notNull(),
  notificationCount: integer("notification_count").default(0).notNull(),
  lastNotifiedAt: timestamp("last_notified_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertWaitlist = typeof waitlistTable.$inferInsert
export type SelectWaitlist = typeof waitlistTable.$inferSelect
