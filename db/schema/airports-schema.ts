/*
<ai_context>
Defines the database schema for airports.
</ai_context>
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const airportsTable = pgTable("airports", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  distance: text("distance").notNull(),
  transferTime: text("transfer_time").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertAirport = typeof airportsTable.$inferInsert
export type SelectAirport = typeof airportsTable.$inferSelect
