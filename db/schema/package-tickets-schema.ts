/*
<ai_context>
Defines the database schema for package tickets.
</ai_context>
*/

import { pgTable, integer, numeric, primaryKey } from "drizzle-orm/pg-core"
import { ticketPackagesTable } from "./ticket-packages-schema"
import { ticketsTable } from "./tickets-schema"

export const packageTicketsTable = pgTable(
  "package_tickets",
  {
    packageId: integer("package_id")
      .references(() => ticketPackagesTable.id)
      .notNull(),
    ticketId: integer("ticket_id").notNull(),
    quantity: integer("quantity").default(1).notNull(),
    discountPercentage: numeric("discount_percentage", {
      precision: 5,
      scale: 2
    })
  },
  table => ({
    compositeKey: primaryKey({ columns: [table.packageId, table.ticketId] })
  })
)

export type InsertPackageTicket = typeof packageTicketsTable.$inferInsert
export type SelectPackageTicket = typeof packageTicketsTable.$inferSelect
