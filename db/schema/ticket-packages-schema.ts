import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const ticketPackagesTable = pgTable("ticket_packages", {
  id: serial("id").primaryKey(),
  raceId: uuid("race_id")
    .references(() => racesTable.id)
    .notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  updatedBy: text("updated_by")
})

export type InsertTicketPackage = typeof ticketPackagesTable.$inferInsert
export type SelectTicketPackage = typeof ticketPackagesTable.$inferSelect
