import {
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
  boolean,
  pgEnum
} from "drizzle-orm/pg-core"
import { tripsTable } from "./trips-schema"

// Enum for booking status
export const bookingStatusEnum = pgEnum("booking_status", [
  "pending", // Initial state when booking is started
  "confirmed", // Successfully booked with airline
  "failed", // Booking attempt failed
  "expired", // Offer expired before completion
  "cancelled" // Booking was cancelled
])

export const flightBookingsTable = pgTable("flight_bookings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  tripId: uuid("trip_id").references(() => tripsTable.id, {
    onDelete: "set null"
  }),
  raceId: uuid("race_id").notNull(), // Reference to the race this booking is for

  // Duffel specific fields
  offerId: text("offer_id").notNull(),
  orderId: text("order_id"), // Duffel order ID once booking is confirmed
  bookingReference: text("booking_reference"), // Airline's booking reference

  // Core booking data
  status: bookingStatusEnum("status").notNull().default("pending"),
  totalAmount: text("total_amount").notNull(), // Store as string to maintain precision
  totalCurrency: text("total_currency").notNull(),

  // Flight details
  departureIata: text("departure_iata").notNull(),
  arrivalIata: text("arrival_iata").notNull(),
  departureCity: text("departure_city"),
  arrivalCity: text("arrival_city"),
  departureTime: timestamp("departure_time").notNull(),
  arrivalTime: timestamp("arrival_time").notNull(),

  // Store complete data
  offerData: jsonb("offer_data").notNull(), // Full offer data for reference
  passengerData: jsonb("passenger_data").notNull(), // Passenger details
  paymentData: jsonb("payment_data"), // Payment information if applicable

  // Metadata
  expiresAt: timestamp("expires_at").notNull(),
  addedToTrip: boolean("added_to_trip").default(false).notNull(),
  lastErrorMessage: text("last_error_message"), // Store last error if booking failed
  paymentRequired: boolean("payment_required").default(true).notNull(),
  paymentRequiredBy: timestamp("payment_required_by"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  completedAt: timestamp("completed_at") // When booking was confirmed
})

export type InsertFlightBooking = typeof flightBookingsTable.$inferInsert
export type SelectFlightBooking = typeof flightBookingsTable.$inferSelect
