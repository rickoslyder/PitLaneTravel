/*
<ai_context>
Defines the database schema for ticket feature mappings.
</ai_context>
*/

import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core"
import { ticketFeaturesTable } from "./ticket-features-schema"
import { ticketsTable } from "./tickets-schema"

export const ticketFeatureMappingsTable = pgTable(
  "ticket_feature_mappings",
  {
    ticketId: integer("ticket_id")
      .references(() => ticketsTable.id)
      .notNull(),
    featureId: integer("feature_id")
      .references(() => ticketFeaturesTable.id)
      .notNull()
  },
  table => ({
    compositeKey: primaryKey({ columns: [table.ticketId, table.featureId] })
  })
)

export type InsertTicketFeatureMapping =
  typeof ticketFeatureMappingsTable.$inferInsert
export type SelectTicketFeatureMapping =
  typeof ticketFeatureMappingsTable.$inferSelect
