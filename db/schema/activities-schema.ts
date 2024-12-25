/*
<ai_context>
Defines the database schema for activities.
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
import { savedItinerariesTable } from "./saved-itineraries-schema"

export const activitiesTable = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  itineraryId: uuid("itinerary_id")
    .references(() => savedItinerariesTable.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  priceAmount: numeric("price_amount", { precision: 10, scale: 2 }),
  priceCurrency: text("price_currency"),
  rating: numeric("rating", { precision: 3, scale: 1 }),
  category: text("category"),
  distance: text("distance"),
  duration: text("duration"),
  locationLat: numeric("location_lat", { precision: 10, scale: 8 }),
  locationLng: numeric("location_lng", { precision: 11, scale: 8 }),
  timeSlot: text("time_slot"),
  description: text("description"),
  visitDuration: text("visit_duration"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertActivity = typeof activitiesTable.$inferInsert
export type SelectActivity = typeof activitiesTable.$inferSelect
