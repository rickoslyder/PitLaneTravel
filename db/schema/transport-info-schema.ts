import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"
import { circuitsTable } from "./circuits-schema"

export const transportInfoTable = pgTable("transport_info", {
  id: uuid("id").defaultRandom().primaryKey(),
  circuitId: uuid("circuit_id")
    .references(() => circuitsTable.id, { onDelete: "cascade" })
    .notNull(),
  type: text("type").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  options: text("options").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertTransportInfo = typeof transportInfoTable.$inferInsert
export type SelectTransportInfo = typeof transportInfoTable.$inferSelect
