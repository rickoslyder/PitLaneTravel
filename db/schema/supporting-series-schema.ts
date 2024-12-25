/*
<ai_context>
Defines the database schema for supporting series.
</ai_context>
*/

import { pgTable, text, timestamp, uuid, integer } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const supportingSeriesTable = pgTable("supporting_series", {
  id: uuid("id").defaultRandom().primaryKey(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  series: text("series").notNull(),
  round: integer("round").notNull(),
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
