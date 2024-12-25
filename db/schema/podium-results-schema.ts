/*
<ai_context>
Defines the database schema for podium results.
</ai_context>
*/

import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const podiumResultsTable = pgTable("podium_results", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  position: integer("position").notNull(),
  driver: text("driver").notNull(),
  team: text("team").notNull(),
  year: integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertPodiumResult = typeof podiumResultsTable.$inferInsert
export type SelectPodiumResult = typeof podiumResultsTable.$inferSelect
