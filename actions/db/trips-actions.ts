"use server"

import { db } from "@/db/db"
import { InsertTrip, SelectTrip, tripsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and, or } from "drizzle-orm"

export async function createTripAction(
  trip: InsertTrip
): Promise<ActionState<SelectTrip>> {
  try {
    const [newTrip] = await db.insert(tripsTable).values(trip).returning()
    return {
      isSuccess: true,
      message: "Trip created successfully",
      data: newTrip
    }
  } catch (error) {
    console.error("Error creating trip:", error)
    return { isSuccess: false, message: "Failed to create trip" }
  }
}

export async function getTripAction(
  id: string,
  userId: string
): Promise<ActionState<SelectTrip>> {
  try {
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
    console.error("Error getting trip:", error)
    return { isSuccess: false, message: "Failed to get trip" }
  }
}

export async function getUserTripsAction(
  userId: string
): Promise<ActionState<SelectTrip[]>> {
  try {
    const trips = await db
      .select()
      .from(tripsTable)
      .where(
        or(eq(tripsTable.userId, userId), eq(tripsTable.visibility, "public"))
      )

    return {
      isSuccess: true,
      message: "Trips retrieved successfully",
      data: trips
    }
  } catch (error) {
    console.error("Error getting trips:", error)
    return { isSuccess: false, message: "Failed to get trips" }
  }
}

export async function updateTripAction(
  id: string,
  userId: string,
  data: Partial<InsertTrip>
): Promise<ActionState<SelectTrip>> {
  try {
    const [updatedTrip] = await db
      .update(tripsTable)
      .set(data)
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
    console.error("Error updating trip:", error)
    return { isSuccess: false, message: "Failed to update trip" }
  }
}

export async function deleteTripAction(
  id: string,
  userId: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(tripsTable)
      .where(and(eq(tripsTable.id, id), eq(tripsTable.userId, userId)))
    return {
      isSuccess: true,
      message: "Trip deleted successfully",
      data: undefined
    }
  } catch (error) {
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
    console.error("Error sharing trip:", error)
    return { isSuccess: false, message: "Failed to share trip" }
  }
}
