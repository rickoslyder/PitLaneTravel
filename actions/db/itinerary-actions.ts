"use server"

import { db } from "@/db/db"
import { savedItinerariesTable } from "@/db/schema"
import { InsertSavedItinerary, SelectSavedItinerary } from "@/db/schema"
import { ActionState } from "@/types"
import { and, eq } from "drizzle-orm"

export async function createItineraryAction(
  userId: string,
  raceId: string,
  name: string,
  description: string | null,
  itinerary: any
): Promise<ActionState<SelectSavedItinerary>> {
  try {
    const [newItinerary] = await db
      .insert(savedItinerariesTable)
      .values({
        userId,
        raceId,
        name,
        description,
        itinerary
      })
      .returning()

    return {
      isSuccess: true,
      message: "Itinerary created successfully",
      data: newItinerary
    }
  } catch (error) {
    console.error("Error creating itinerary:", error)
    return { isSuccess: false, message: "Failed to create itinerary" }
  }
}

export async function getItinerariesAction(
  userId: string,
  raceId: string
): Promise<ActionState<SelectSavedItinerary[]>> {
  try {
    const itineraries = await db
      .select()
      .from(savedItinerariesTable)
      .where(
        and(
          eq(savedItinerariesTable.userId, userId),
          eq(savedItinerariesTable.raceId, raceId)
        )
      )

    return {
      isSuccess: true,
      message: "Itineraries retrieved successfully",
      data: itineraries
    }
  } catch (error) {
    console.error("Error getting itineraries:", error)
    return { isSuccess: false, message: "Failed to get itineraries" }
  }
}

export async function updateItineraryAction(
  userId: string,
  id: string,
  data: Partial<InsertSavedItinerary>
): Promise<ActionState<SelectSavedItinerary>> {
  try {
    const [updatedItinerary] = await db
      .update(savedItinerariesTable)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(savedItinerariesTable.id, id),
          eq(savedItinerariesTable.userId, userId)
        )
      )
      .returning()

    if (!updatedItinerary) {
      return { isSuccess: false, message: "Itinerary not found or access denied" }
    }

    return {
      isSuccess: true,
      message: "Itinerary updated successfully",
      data: updatedItinerary
    }
  } catch (error) {
    console.error("Error updating itinerary:", error)
    return { isSuccess: false, message: "Failed to update itinerary" }
  }
}

export async function deleteItineraryAction(
  userId: string,
  id: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(savedItinerariesTable)
      .where(
        and(
          eq(savedItinerariesTable.id, id),
          eq(savedItinerariesTable.userId, userId)
        )
      )

    return {
      isSuccess: true,
      message: "Itinerary deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting itinerary:", error)
    return { isSuccess: false, message: "Failed to delete itinerary" }
  }
} 