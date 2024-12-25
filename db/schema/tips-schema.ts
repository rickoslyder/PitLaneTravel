import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const tipsTable = pgTable("tips", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  content: text("content").notNull(),
  category: text("category").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertTip = typeof tipsTable.$inferInsert
export type SelectTip = typeof tipsTable.$inferSelect
