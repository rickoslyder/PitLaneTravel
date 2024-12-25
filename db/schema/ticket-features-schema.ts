import { pgTable, primaryKey, serial, text } from "drizzle-orm/pg-core"
import { ticketsTable } from "./tickets-schema"

export const ticketFeaturesTable = pgTable("ticket_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description")
})

export const ticketFeatureMappingsTable = pgTable(
  "ticket_feature_mappings",
  {
    ticketId: serial("ticket_id")
      .references(() => ticketsTable.id)
      .notNull(),
    featureId: serial("feature_id")
      .references(() => ticketFeaturesTable.id)
      .notNull()
  },
  table => ({
    pk: primaryKey({ columns: [table.ticketId, table.featureId] })
  })
)

export type InsertTicketFeature = typeof ticketFeaturesTable.$inferInsert
export type SelectTicketFeature = typeof ticketFeaturesTable.$inferSelect
export type InsertTicketFeatureMapping =
  typeof ticketFeatureMappingsTable.$inferInsert
export type SelectTicketFeatureMapping =
  typeof ticketFeatureMappingsTable.$inferSelect
