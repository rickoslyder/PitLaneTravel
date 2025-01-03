/*
<ai_context>
Defines the database schema for tickets.
</ai_context>
*/

import {
  boolean,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const ticketsTable = pgTable("tickets", {
  id: serial("id").primaryKey(),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ticketType: text("ticket_type").notNull(),
  availability: text("availability").notNull(),
  daysIncluded: jsonb("days_included").notNull(),
  isChildTicket: boolean("is_child_ticket").default(false).notNull(),
  resellerUrl: text("reseller_url").notNull(),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
})

export type InsertTicket = typeof ticketsTable.$inferInsert
export type SelectTicket = typeof ticketsTable.$inferSelect
