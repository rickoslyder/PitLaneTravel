import {
  numeric,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp
} from "drizzle-orm/pg-core"
import { ticketsTable } from "./tickets-schema"

export const ticketPackagesTable = pgTable("ticket_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow()
})

export const packageTicketsTable = pgTable(
  "package_tickets",
  {
    packageId: serial("package_id")
      .references(() => ticketPackagesTable.id)
      .notNull(),
    ticketId: serial("ticket_id")
      .references(() => ticketsTable.id)
      .notNull(),
    quantity: numeric("quantity").notNull().default("1"),
    discountPercentage: numeric("discount_percentage", {
      precision: 5,
      scale: 2
    })
  },
  table => ({
    pk: primaryKey({ columns: [table.packageId, table.ticketId] })
  })
)

export type InsertTicketPackage = typeof ticketPackagesTable.$inferInsert
export type SelectTicketPackage = typeof ticketPackagesTable.$inferSelect
export type InsertPackageTicket = typeof packageTicketsTable.$inferInsert
export type SelectPackageTicket = typeof packageTicketsTable.$inferSelect
