"use server"

import { db } from "@/db/db"
import {
  InsertSavedItinerary,
  SelectSavedItinerary,
  savedItinerariesTable,
  racesTable,
  circuitsTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and } from "drizzle-orm"

interface ItineraryData {
  raceId: string
  itinerary: any
}

interface RaceDetails {
  name: string
  date: Date
  circuit: {
    name: string
    location: string
    country: string
  }
}

// Create a new itinerary
export async function createItineraryAction(
  userId: string,
  data: ItineraryData
): Promise<ActionState<SelectSavedItinerary>> {
  try {
    const [newItinerary] = await db
      .insert(savedItinerariesTable)
      .values({
        userId,
        name: `Race Itinerary - ${new Date().toLocaleDateString()}`,
        description: "Race itinerary",
        raceId: data.raceId,
        itinerary: data.itinerary
      } as InsertSavedItinerary)
      .returning()

    return {
      isSuccess: true,
      message: "Itinerary saved successfully",
      data: newItinerary
    }
  } catch (error) {
    console.error("Error creating itinerary:", error)
    return { isSuccess: false, message: "Failed to save itinerary" }
  }
}

// Get a specific itinerary
export async function getItineraryAction(
  userId: string,
  id: string
): Promise<ActionState<SelectSavedItinerary>> {
  try {
    const [itinerary] = await db
      .select()
      .from(savedItinerariesTable)
      .where(
        and(eq(savedItinerariesTable.id, id), eq(savedItinerariesTable.userId, userId))
      )

    if (!itinerary) {
      return { isSuccess: false, message: "Itinerary not found" }
    }

    return {
      isSuccess: true,
      message: "Itinerary retrieved successfully",
      data: itinerary
    }
  } catch (error) {
    console.error("Error getting itinerary:", error)
    return { isSuccess: false, message: "Failed to get itinerary" }
  }
}

// Get all itineraries for a user
export async function getUserItinerariesAction(
  userId: string
): Promise<ActionState<SelectSavedItinerary[]>> {
  try {
    const itineraries = await db
      .select()
      .from(savedItinerariesTable)
      .where(eq(savedItinerariesTable.userId, userId))
      .orderBy(savedItinerariesTable.createdAt)

    return {
      isSuccess: true,
      message: "Itineraries retrieved successfully",
      data: itineraries
    }
  } catch (error) {
    console.error("Error getting user itineraries:", error)
    return { isSuccess: false, message: "Failed to get itineraries" }
  }
}

// Get all itineraries for a specific race
export async function getRaceItinerariesAction(
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
      .orderBy(savedItinerariesTable.createdAt)

    return {
      isSuccess: true,
      message: "Race itineraries retrieved successfully",
      data: itineraries
    }
  } catch (error) {
    console.error("Error getting race itineraries:", error)
    return { isSuccess: false, message: "Failed to get race itineraries" }
  }
}

// Update an itinerary
export async function updateItineraryAction(
  userId: string,
  id: string,
  itinerary: any
): Promise<ActionState<SelectSavedItinerary>> {
  try {
    const [updatedItinerary] = await db
      .update(savedItinerariesTable)
      .set({
        itinerary,
        updatedAt: new Date()
      })
      .where(
        and(eq(savedItinerariesTable.id, id), eq(savedItinerariesTable.userId, userId))
      )
      .returning()

    if (!updatedItinerary) {
      return { isSuccess: false, message: "Itinerary not found" }
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

// Delete an itinerary
export async function deleteItineraryAction(
  userId: string,
  id: string
): Promise<ActionState<void>> {
  try {
    await db
      .delete(savedItinerariesTable)
      .where(
        and(eq(savedItinerariesTable.id, id), eq(savedItinerariesTable.userId, userId))
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

// Get itinerary with race details
export async function getItineraryWithRaceAction(
  userId: string,
  id: string
): Promise<ActionState<SelectSavedItinerary & { race: RaceDetails }>> {
  try {
    const result = await db
      .select({
        id: savedItinerariesTable.id,
        userId: savedItinerariesTable.userId,
        name: savedItinerariesTable.name,
        description: savedItinerariesTable.description,
        raceId: savedItinerariesTable.raceId,
        itinerary: savedItinerariesTable.itinerary,
        createdAt: savedItinerariesTable.createdAt,
        updatedAt: savedItinerariesTable.updatedAt,
        raceName: racesTable.name,
        raceDate: racesTable.date,
        circuitName: circuitsTable.name,
        circuitLocation: circuitsTable.location,
        circuitCountry: circuitsTable.country
      })
      .from(savedItinerariesTable)
      .innerJoin(racesTable, eq(racesTable.id, savedItinerariesTable.raceId))
      .innerJoin(circuitsTable, eq(circuitsTable.id, racesTable.circuitId))
      .where(
        and(eq(savedItinerariesTable.id, id), eq(savedItinerariesTable.userId, userId))
      )

    const [row] = result
    if (!row) {
      return { isSuccess: false, message: "Itinerary not found" }
    }

    const {
      raceName,
      raceDate,
      circuitName,
      circuitLocation,
      circuitCountry,
      ...itinerary
    } = row

    return {
      isSuccess: true,
      message: "Itinerary retrieved successfully",
      data: {
        id: itinerary.id,
        userId: itinerary.userId,
        name: itinerary.name,
        description: itinerary.description,
        raceId: itinerary.raceId,
        itinerary: itinerary.itinerary,
        createdAt: itinerary.createdAt,
        updatedAt: itinerary.updatedAt,
        race: {
          name: raceName,
          date: new Date(raceDate),
          circuit: {
            name: circuitName,
            location: circuitLocation,
            country: circuitCountry
          }
        }
      }
    }
  } catch (error) {
    console.error("Error getting itinerary with race:", error)
    return { isSuccess: false, message: "Failed to get itinerary with race" }
  }
}
