/*
<ai_context>
Defines the database schema for airports.
</ai_context>
*/

import { decimal, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const airportsTable = pgTable("airports", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  distance: decimal("distance", { precision: 10, scale: 2 }).notNull(),
  transferTime: text("transfer_time").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertAirport = typeof airportsTable.$inferInsert
export type SelectAirport = typeof airportsTable.$inferSelect
