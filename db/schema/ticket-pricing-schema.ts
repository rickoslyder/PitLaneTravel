import { decimal, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core"
import { ticketsTable } from "./tickets-schema"

export const ticketPricingTable = pgTable("ticket_pricing", {
  id: serial("id").primaryKey(),
  ticketId: serial("ticket_id")
    .references(() => ticketsTable.id, { onDelete: "cascade" })
    .notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull(),
  validFrom: timestamp("valid_from", { withTimezone: true }).notNull(),
  validTo: timestamp("valid_to", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  updatedBy: text("updated_by")
})

export type InsertTicketPricing = typeof ticketPricingTable.$inferInsert
export type SelectTicketPricing = typeof ticketPricingTable.$inferSelect
