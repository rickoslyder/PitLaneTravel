/*
<ai_context>
Defines the database schema for trips.
</ai_context>
*/

import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const tripVisibilityEnum = pgEnum("trip_visibility", [
  "private",
  "public",
  "shared"
])

export const tripsTable = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  visibility: tripVisibilityEnum("visibility").default("private").notNull(),
  sharedWith: text("shared_with").array(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull()
})

export type InsertTrip = typeof tripsTable.$inferInsert
export type SelectTrip = typeof tripsTable.$inferSelect
