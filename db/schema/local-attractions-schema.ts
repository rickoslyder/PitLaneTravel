/*
<ai_context>
Defines the database schema for local attractions.
</ai_context>
*/

import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const localAttractionsTable = pgTable("local_attractions", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertLocalAttraction = typeof localAttractionsTable.$inferInsert
export type SelectLocalAttraction = typeof localAttractionsTable.$inferSelect
