/*
<ai_context>
Defines the database schema for trips.
</ai_context>
*/

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb
} from "drizzle-orm/pg-core"
import { racesTable } from "./races-schema"

export const tripVisibilityEnum = pgEnum("trip_visibility", [
  "private",
  "public",
  "shared"
])

export const tripStatusEnum = pgEnum("trip_status", [
  "planning", // Initial state
  "booked", // Core bookings made
  "completed" // Trip finished
])

interface FlightDetails {
  departure: string | null
  arrival: string | null
  layovers: string[]
  bookingReference: string | null
  ticketNumbers?: string[]
  baggageAllowance?: string | null
}

interface Flights {
  outbound: FlightDetails | null
  return: FlightDetails | null
}

interface Accommodation {
  name: string | null
  location: string | null
  roomType: string | null
  checkIn: string | null
  checkOut: string | null
  bookingReference: string | null
  confirmationCode: string | null
}

interface SavedMerch {
  id: string
  name: string
  description: string
  category:
    | "clothing"
    | "accessories"
    | "memorabilia"
    | "collectibles"
    | "other"
  price: string
  currency: string
  imageUrl?: string
  purchaseUrl?: string
  inStock: string
}

export const tripsTable = pgTable("trips", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  visibility: tripVisibilityEnum("visibility").default("private").notNull(),
  status: tripStatusEnum("status").default("planning").notNull(),
  sharedWith: text("shared_with").array(),

  // Core trip details
  raceId: uuid("race_id")
    .references(() => racesTable.id, { onDelete: "cascade" })
    .notNull(),

  // Travel details
  flights: jsonb("flights").$type<Flights>().default({
    outbound: null,
    return: null
  }),

  // Accommodation
  accommodation: jsonb("accommodation").$type<Accommodation>().default({
    name: null,
    location: null,
    roomType: null,
    checkIn: null,
    checkOut: null,
    bookingReference: null,
    confirmationCode: null
  }),

  // Additional details
  transportationNotes: text("transportation_notes"),
  packingList: text("packing_list").array(),
  customNotes: jsonb("custom_notes").default({}),
  savedMerch: jsonb("saved_merch").$type<SavedMerch[]>().default([]),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date())
})

export type InsertTrip = typeof tripsTable.$inferInsert
export type SelectTrip = typeof tripsTable.$inferSelect
