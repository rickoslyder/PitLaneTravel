"use server"

import { db } from "@/db/db"
import { circuitLocationsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { findAirportCoordinates, findNearbyAirports } from "@/lib/google-places"
import { eq, and, or, isNull } from "drizzle-orm"

export async function syncAirportCoordinatesAction(): Promise<ActionState<number>> {
  try {
    // Get all airport locations with missing coordinates
    const airportsToUpdate = await db
      .select()
      .from(circuitLocationsTable)
      .where(
        and(
          eq(circuitLocationsTable.type, "airport"),
          or(
            isNull(circuitLocationsTable.latitude),
            isNull(circuitLocationsTable.longitude),
            eq(circuitLocationsTable.latitude, "0"),
            eq(circuitLocationsTable.longitude, "0")
          )
        )
      )

    let updatedCount = 0
    for (const airport of airportsToUpdate) {
      const searchTerm = airport.airportCode || airport.name
      const coordinates = await findAirportCoordinates(searchTerm)
      
      if (coordinates) {
        await db
          .update(circuitLocationsTable)
          .set({
            latitude: coordinates.latitude.toString(),
            longitude: coordinates.longitude.toString()
          })
          .where(eq(circuitLocationsTable.id, airport.id))
        
        updatedCount++
      }
    }

    return {
      isSuccess: true,
      message: `Updated coordinates for ${updatedCount} airports`,
      data: updatedCount
    }
  } catch (error) {
    console.error("Error syncing airport coordinates:", error)
    return { isSuccess: false, message: "Failed to sync airport coordinates" }
  }
}

export async function findNearbyAirportsAction(
  circuitId: string,
  latitude: number,
  longitude: number
): Promise<ActionState<number>> {
  try {
    const airports = await findNearbyAirports(latitude, longitude)
    let addedCount = 0

    for (const airport of airports) {
      // Check if airport already exists
      const existing = await db
        .select()
        .from(circuitLocationsTable)
        .where(
          and(
            eq(circuitLocationsTable.circuitId, circuitId),
            eq(circuitLocationsTable.type, "airport"),
            eq(circuitLocationsTable.name, airport.name)
          )
        )

      if (existing.length === 0) {
        await db.insert(circuitLocationsTable).values({
          circuitId,
          type: "airport",
          name: airport.name,
          latitude: airport.latitude.toString(),
          longitude: airport.longitude.toString(),
          distanceFromCircuit: airport.distance.toString(),
          placeId: airport.placeId,
          transferTime: `${Math.round(airport.distance / 60)} hour(s)` // Rough estimate
        })
        addedCount++
      }
    }

    return {
      isSuccess: true,
      message: `Added ${addedCount} new airports`,
      data: addedCount
    }
  } catch (error) {
    console.error("Error finding nearby airports:", error)
    return { isSuccess: false, message: "Failed to find nearby airports" }
  }
} 