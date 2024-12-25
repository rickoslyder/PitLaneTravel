/*
<ai_context>
Defines the database schema for circuit details.
</ai_context>
*/

import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  integer
} from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const circuitDetailsTable = pgTable("circuit_details", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  length: numeric("length", { precision: 10, scale: 3 }).notNull(),
  corners: integer("corners").notNull(),
  drsZones: integer("drs_zones").notNull(),
  lapRecordTime: text("lap_record_time"),
  lapRecordYear: integer("lap_record_year"),
  lapRecordDriver: text("lap_record_driver"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCircuitDetail = typeof circuitDetailsTable.$inferInsert
export type SelectCircuitDetail = typeof circuitDetailsTable.$inferSelect
