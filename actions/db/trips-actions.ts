"use server"

import { db } from "@/db/db"
import { InsertTrip, SelectTrip, tripsTable, racesTable, circuitsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and, or } from "drizzle-orm"
import { relations } from "drizzle-orm"
import { requireAuth, assertOwnershipOrAdmin, AuthError } from "@/lib/auth"

// Define relations
const tripRelations = relations(tripsTable, ({ one }) => ({
  race: one(racesTable, {
    fields: [tripsTable.raceId],
    references: [racesTable.id]
  })
}))

const raceRelations = relations(racesTable, ({ one }) => ({
  circuit: one(circuitsTable, {
    fields: [racesTable.circuitId],
    references: [circuitsTable.id]
  })
}))

interface TripWithRace extends SelectTrip {
  race: {
    name: string
    date: Date
    circuit: {
      name: string
      country: string
    }
  }
}

export async function createTripAction(
  trip: InsertTrip
): Promise<ActionState<SelectTrip>> {
  try {
    // Force ownership to the authenticated user; never trust a client-supplied userId.
    const userId = await requireAuth()

    // Don't let users plan a trip to a cancelled race.
    const [race] = await db
      .select({ status: racesTable.status })
      .from(racesTable)
      .where(eq(racesTable.id, trip.raceId))
      .limit(1)
    if (race?.status === "cancelled") {
      return { isSuccess: false, message: "This race has been cancelled" }
    }

    const [newTrip] = await db
      .insert(tripsTable)
      .values({ ...trip, userId })
      .returning()
    return {
      isSuccess: true,
      message: "Trip created successfully",
      data: newTrip
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error creating trip:", error)
    return { isSuccess: false, message: "Failed to create trip" }
  }
}

export async function getTripAction(
  id: string,
  userId: string
): Promise<ActionState<SelectTrip>> {
  try {
    await assertOwnershipOrAdmin(userId)
    const [trip] = await db
      .select()
      .from(tripsTable)
      .where(
        and(
          eq(tripsTable.id, id),
          or(eq(tripsTable.userId, userId), eq(tripsTable.visibility, "public"))
        )
      )

    if (!trip) {
      return { isSuccess: false, message: "Trip not found or access denied" }
    }

    return {
      isSuccess: true,
      message: "Trip retrieved successfully",
      data: trip
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error getting trip:", error)
    return { isSuccess: false, message: "Failed to get trip" }
  }
}

export async function getUserTripsAction(
  userId: string
): Promise<ActionState<TripWithRace[]>> {
  try {
    await assertOwnershipOrAdmin(userId)
    const trips = await db
      .select()
      .from(tripsTable)
      .innerJoin(racesTable, eq(racesTable.id, tripsTable.raceId))
      .innerJoin(circuitsTable, eq(circuitsTable.id, racesTable.circuitId))
      .where(
        or(eq(tripsTable.userId, userId), eq(tripsTable.visibility, "public"))
      )

    return {
      isSuccess: true,
      message: "Trips retrieved successfully",
      data: trips.map(({ trips, races, circuits }) => ({
        ...trips,
        race: {
          name: races.name,
          date: races.date,
          circuit: {
            name: circuits.name,
            country: circuits.country
          }
        }
      })) as TripWithRace[]
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error getting trips:", error)
    return { isSuccess: false, message: "Failed to get trips" }
  }
}

export async function getUserTripForRaceAction(
  userId: string,
  raceId: string
): Promise<ActionState<SelectTrip | undefined>> {
  try {
    await assertOwnershipOrAdmin(userId)
    const [trip] = await db
      .select()
      .from(tripsTable)
      .where(
        and(
          eq(tripsTable.userId, userId),
          eq(tripsTable.raceId, raceId)
        )
      )
      .limit(1)

    return {
      isSuccess: true,
      message: trip ? "Trip found" : "No trip found",
      data: trip
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error getting trip for race:", error)
    return { isSuccess: false, message: "Failed to get trip for race" }
  }
}

export async function updateTripAction(
  id: string,
  userId: string,
  data: Partial<InsertTrip>
): Promise<ActionState<SelectTrip>> {
  try {
    await assertOwnershipOrAdmin(userId)
    // Never allow the update payload to reassign ownership.
    const { userId: _ignored, ...safeData } = data
    const [updatedTrip] = await db
      .update(tripsTable)
      .set(safeData)
      .where(and(eq(tripsTable.id, id), eq(tripsTable.userId, userId)))
      .returning()

    if (!updatedTrip) {
      return { isSuccess: false, message: "Trip not found or access denied" }
    }

    return {
      isSuccess: true,
      message: "Trip updated successfully",
      data: updatedTrip
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error updating trip:", error)
    return { isSuccess: false, message: "Failed to update trip" }
  }
}

export async function deleteTripAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
  try {
    await assertOwnershipOrAdmin(userId)
    await db
      .delete(tripsTable)
      .where(and(eq(tripsTable.id, id), eq(tripsTable.userId, userId)))
    return {
      isSuccess: true,
      message: "Trip deleted successfully",
      data: undefined
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error deleting trip:", error)
    return { isSuccess: false, message: "Failed to delete trip" }
  }
}

export async function shareTripAction(
  id: string,
  userId: string,
  shareWithUserId: string
): Promise<ActionState<SelectTrip>> {
  try {
    await assertOwnershipOrAdmin(userId)
    const [trip] = await db
      .select()
      .from(tripsTable)
      .where(and(eq(tripsTable.id, id), eq(tripsTable.userId, userId)))

    if (!trip) {
      return { isSuccess: false, message: "Trip not found or access denied" }
    }

    const sharedWith = [...(trip.sharedWith || []), shareWithUserId]

    const [updatedTrip] = await db
      .update(tripsTable)
      .set({
        sharedWith,
        visibility: "shared" as const
      })
      .where(eq(tripsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Trip shared successfully",
      data: updatedTrip
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    console.error("Error sharing trip:", error)
    return { isSuccess: false, message: "Failed to share trip" }
  }
}
