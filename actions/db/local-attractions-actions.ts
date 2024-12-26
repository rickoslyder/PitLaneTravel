"use server"

import { db } from "@/db/db"
import { localAttractionsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"
import { searchNearbyPlaces, getPlaceDetails } from "@/lib/google-places"

export async function getLocalAttractionsAction(
  circuitId: string
): Promise<ActionState<typeof localAttractionsTable.$inferSelect[]>> {
  try {
    const attractions = await db
      .select()
      .from(localAttractionsTable)
      .where(eq(localAttractionsTable.circuitId, circuitId))

    return {
      isSuccess: true,
      message: "Local attractions retrieved successfully",
      data: attractions
    }
  } catch (error) {
    console.error("Error getting local attractions:", error)
    return { isSuccess: false, message: "Failed to get local attractions" }
  }
}

export async function searchNearbyPlacesAction(
  latitude: number,
  longitude: number,
  radius: number,
  type?: string
) {
  try {
    const places = await searchNearbyPlaces(latitude, longitude, radius, type)
    return {
      isSuccess: true,
      message: "Places retrieved successfully",
      data: places
    }
  } catch (error) {
    console.error("Error searching nearby places:", error)
    return { isSuccess: false, message: "Failed to search nearby places" }
  }
}

export async function getPlaceDetailsAction(placeId: string) {
  try {
    const place = await getPlaceDetails(placeId)
    return {
      isSuccess: true,
      message: "Place details retrieved successfully",
      data: place
    }
  } catch (error) {
    console.error("Error getting place details:", error)
    return { isSuccess: false, message: "Failed to get place details" }
  }
}

export async function createLocalAttractionAction(
  attraction: typeof localAttractionsTable.$inferInsert
): Promise<ActionState<typeof localAttractionsTable.$inferSelect>> {
  try {
    const [newAttraction] = await db
      .insert(localAttractionsTable)
      .values(attraction)
      .returning()

    return {
      isSuccess: true,
      message: "Local attraction created successfully",
      data: newAttraction
    }
  } catch (error) {
    console.error("Error creating local attraction:", error)
    return { isSuccess: false, message: "Failed to create local attraction" }
  }
}

export async function updateLocalAttractionAction(
  id: string,
  data: Partial<typeof localAttractionsTable.$inferInsert>
): Promise<ActionState<typeof localAttractionsTable.$inferSelect>> {
  try {
    const [updatedAttraction] = await db
      .update(localAttractionsTable)
      .set(data)
      .where(eq(localAttractionsTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Local attraction updated successfully",
      data: updatedAttraction
    }
  } catch (error) {
    console.error("Error updating local attraction:", error)
    return { isSuccess: false, message: "Failed to update local attraction" }
  }
}

export async function deleteLocalAttractionAction(
  id: string
): Promise<ActionState<void>> {
  try {
    await db.delete(localAttractionsTable).where(eq(localAttractionsTable.id, id))
    return {
      isSuccess: true,
      message: "Local attraction deleted successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error deleting local attraction:", error)
    return { isSuccess: false, message: "Failed to delete local attraction" }
  }
} 