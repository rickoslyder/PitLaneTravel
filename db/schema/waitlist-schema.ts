import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const waitlistTable = pgTable("waitlist", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  ticketCategoryId: text("ticket_category_id").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  notificationType: text("notification_type").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertWaitlist = typeof waitlistTable.$inferInsert
export type SelectWaitlist = typeof waitlistTable.$inferSelect
