import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const adminActivityTypeEnum = pgEnum("admin_activity_type", [
  "ticket",
  "meetup",
  "transport",
  "attraction",
  "series"
])

export const adminActivitiesTable = pgTable("admin_activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  type: adminActivityTypeEnum("type").notNull(),
  description: text("description").notNull(),
  userId: text("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertAdminActivity = typeof adminActivitiesTable.$inferInsert
export type SelectAdminActivity = typeof adminActivitiesTable.$inferSelect
