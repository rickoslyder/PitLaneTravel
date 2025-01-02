/*
<ai_context>
Defines the database schema for circuits.
</ai_context>
*/

import {
  pgTable,
  text,
  timestamp,
  uuid,
  numeric,
  integer
} from "drizzle-orm/pg-core"

export const circuitsTable = pgTable("circuits", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  country: text("country").notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: numeric("longitude", { precision: 10, scale: 7 }).notNull(),
  imageUrl: text("image_url"),
  // Timezone information
  timezoneId: text("timezone_id"),
  timezoneName: text("timezone_name"),
  // OpenF1 integration fields
  openf1Key: integer("openf1_key").unique(),
  openf1ShortName: text("openf1_short_name"),
  websiteUrl: text("website_url"),
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
