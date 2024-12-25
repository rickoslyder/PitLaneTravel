import { pgTable, text, timestamp, uuid, jsonb } from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const savedItinerariesTable = pgTable("saved_itineraries", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),
  itinerary: jsonb("itinerary"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertSavedItinerary = typeof savedItinerariesTable.$inferInsert
export type SelectSavedItinerary = typeof savedItinerariesTable.$inferSelect
