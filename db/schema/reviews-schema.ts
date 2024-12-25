/*
<ai_context>
Defines the database schema for reviews.
</ai_context>
*/

import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const reviewsTable = pgTable("reviews", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  rating: integer("rating").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertReview = typeof reviewsTable.$inferInsert
export type SelectReview = typeof reviewsTable.$inferSelect
