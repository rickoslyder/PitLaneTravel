import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"

export const notificationChannelEnum = pgEnum("notification_channel", [
  "email",
  "sms",
  "both",
  "none"
])

export const notificationPreferencesTable = pgTable(
  "notification_preferences",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    preferredChannel: notificationChannelEnum("preferred_channel")
      .default("email")
      .notNull(),
    ticketAvailabilityEnabled: boolean("ticket_availability_enabled")
      .default(true)
      .notNull(),
    priceChangeEnabled: boolean("price_change_enabled").default(true).notNull(),
    packageAvailabilityEnabled: boolean("package_availability_enabled")
      .default(true)
      .notNull(),
    maxNotificationsPerDay: integer("max_notifications_per_day")
      .default(3)
      .notNull(),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date())
  }
)

export type InsertNotificationPreference =
  typeof notificationPreferencesTable.$inferInsert
export type SelectNotificationPreference =
  typeof notificationPreferencesTable.$inferSelect
