/*
<ai_context>
Defines the database schema for local attractions.
</ai_context>
*/

import {
  boolean,
  decimal,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const localAttractionsTable = pgTable("local_attractions", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  distance_from_circuit: decimal("distance_from_circuit", {
    precision: 5,
    scale: 2
  }),
  distance_from_city: decimal("distance_from_city", { precision: 5, scale: 2 }),
  estimated_duration: text("estimated_duration"),
  recommended_times: text("recommended_times").array(),
  booking_required: boolean("booking_required").default(false),
  price_range: text("price_range"),
  f1_relevance: text("f1_relevance"),
  peak_times: jsonb("peak_times"),
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
