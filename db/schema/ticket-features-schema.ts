import { pgTable, serial, text } from "drizzle-orm/pg-core"

export const ticketFeaturesTable = pgTable("ticket_features", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description")
})

export type InsertTicketFeature = typeof ticketFeaturesTable.$inferInsert
export type SelectTicketFeature = typeof ticketFeaturesTable.$inferSelect
