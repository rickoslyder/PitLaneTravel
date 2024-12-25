/*
<ai_context>
Defines the database schema for circuits.
</ai_context>
*/

import { pgTable, text, timestamp, uuid, numeric } from "drizzle-orm/pg-core"

export const circuitsTable = pgTable("circuits", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertCircuit = typeof circuitsTable.$inferInsert
export type SelectCircuit = typeof circuitsTable.$inferSelect
