/*
<ai_context>
Internal (non-Server-Action) data access for flight bookings.

Deliberately NOT under actions/ and deliberately without "use server": every export of a
"use server" module becomes a publicly callable endpoint, and these helpers write
arbitrary columns. They are only called from server code that has already authenticated
and authorised the caller.
</ai_context>
*/

import "server-only"

import { db } from "@/db/db"
import {
  flightBookingsTable,
  InsertFlightBooking,
  SelectFlightBooking
} from "@/db/schema/flight-bookings-schema"
import { and, eq, isNotNull, isNull, lt } from "drizzle-orm"

/** A reservation older than this with no airline order is treated as abandoned. */
export const STALE_RESERVATION_MINUTES = 15

export async function updateFlightBookingById(
  id: string,
  data: Partial<InsertFlightBooking>
): Promise<SelectFlightBooking | null> {
  const [updated] = await db
    .update(flightBookingsTable)
    .set(data)
    .where(eq(flightBookingsTable.id, id))
    .returning()
  return updated ?? null
}

/** The booking, if any, that a PaymentIntent is already attached to. */
export async function findBookingByPaymentIntent(
  paymentIntentId: string
): Promise<SelectFlightBooking | null> {
  const [row] = await db
    .select()
    .from(flightBookingsTable)
    .where(eq(flightBookingsTable.paymentIntentId, paymentIntentId))
    .limit(1)
  return row ?? null
}

/**
 * Reclaim a reservation abandoned by a crashed request: still `pending`, never got an
 * airline order, and older than the stale window. Returns the row id when it was taken
 * over, so a retry is not blocked forever by the unique index.
 */
export async function reclaimStaleReservation(
  paymentIntentId: string
): Promise<string | null> {
  const cutoff = new Date(Date.now() - STALE_RESERVATION_MINUTES * 60 * 1000)
  // Atomic compare-and-swap: the predicate tests `updatedAt` and the update moves it
  // forward, so a second concurrent retry no longer matches and claims nothing.
  // Testing only `createdAt` would let BOTH retries win, and the loser would go on to
  // re-order the offer and refund a payment backing the winner's ticket.
  const [row] = await db
    .update(flightBookingsTable)
    .set({ updatedAt: new Date() })
    .where(
      and(
        eq(flightBookingsTable.paymentIntentId, paymentIntentId),
        eq(flightBookingsTable.status, "pending"),
        lt(flightBookingsTable.createdAt, cutoff),
        lt(flightBookingsTable.updatedAt, cutoff)
      )
    )
    .returning({ id: flightBookingsTable.id })
  return row?.id ?? null
}

/** An existing booking by this user for a given Duffel offer, if any. */
export async function findBookingByOffer(
  offerId: string,
  userId: string
): Promise<SelectFlightBooking | null> {
  const [row] = await db
    .select()
    .from(flightBookingsTable)
    .where(
      and(
        eq(flightBookingsTable.offerId, offerId),
        eq(flightBookingsTable.userId, userId)
      )
    )
    .limit(1)
  return row ?? null
}

/**
 * Reservations that were charged but never completed: still `pending`, no airline order,
 * and older than the stale window. These represent money taken with nothing delivered —
 * the process-death case the booking route cannot recover from on its own.
 */
export async function findAbandonedReservations(
  limit = 100
): Promise<SelectFlightBooking[]> {
  const cutoff = new Date(Date.now() - STALE_RESERVATION_MINUTES * 60 * 1000)
  return db
    .select()
    .from(flightBookingsTable)
    .where(
      and(
        eq(flightBookingsTable.status, "pending"),
        isNull(flightBookingsTable.orderId),
        isNotNull(flightBookingsTable.paymentIntentId),
        lt(flightBookingsTable.createdAt, cutoff)
      )
    )
    .limit(limit)
}
