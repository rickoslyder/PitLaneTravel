/*
<ai_context>
Defines the database schema for supporting series.
</ai_context>
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer
} from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const supportingSeriesStatusEnum = pgEnum("supporting_series_status", [
  "scheduled",
  "live",
  "completed",
  "delayed",
  "cancelled"
])

export const supportingSeriesTable = pgTable("supporting_series", {
  id: uuid("id").defaultRandom().primaryKey(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  series: text("series").notNull(),
  round: integer("round").notNull(),
  // OpenF1 integration fields
  openf1SessionKey: integer("openf1_session_key").unique(),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  status: supportingSeriesStatusEnum("status").default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertSupportingSeries = typeof supportingSeriesTable.$inferInsert
export type SelectSupportingSeries = typeof supportingSeriesTable.$inferSelect
