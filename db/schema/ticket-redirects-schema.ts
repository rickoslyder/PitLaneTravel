import { pgTable, uuid, text, timestamp, integer } from "drizzle-orm/pg-core"
import { ticketsTable } from "./tickets-schema"

export const ticketRedirectsTable = pgTable("ticket_redirects", {
  id: uuid("id").defaultRandom().primaryKey(),
  ticketId: integer("ticket_id")
    .references(() => ticketsTable.id, { onDelete: "cascade" })
    .notNull(),
  slug: text("slug").notNull().unique(),
  destinationUrl: text("destination_url").notNull(),
  clicks: integer("clicks").default(0).notNull(),
  lastClickedAt: timestamp("last_clicked_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertTicketRedirect = typeof ticketRedirectsTable.$inferInsert
export type SelectTicketRedirect = typeof ticketRedirectsTable.$inferSelect
