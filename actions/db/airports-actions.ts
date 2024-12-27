"use server"

import { db } from "@/db/db"
import { circuitLocationsTable } from "@/db/schema"
import { ActionState } from "@/types"
import { findAirportCoordinates, findNearbyAirports } from "@/lib/google-places"
import { eq, and, or, isNull } from "drizzle-orm"
import { Duffel } from "@duffel/api"

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || ""
})

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
            longitude: coordinates.longitude.toString(),
            airportCode: coordinates.airportCode || airport.airportCode // Keep existing code if none found
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
  latitude: number,
  longitude: number,
  radiusInKm: number = 200,
  airportCode?: string
): Promise<ActionState<Array<{
  name: string
  latitude: number
  longitude: number
  distance: number
  placeId?: string
  airportCode?: string
}>>> {
  try {
    let response;
    
    if (airportCode) {
      // Search for specific airport
      response = await duffel.suggestions.list({
        query: airportCode
      })
    } else {
      // Search by radius
      const radiusInMeters = radiusInKm * 1000
      response = await duffel.suggestions.list({
        lat: latitude.toString(),
        lng: longitude.toString(),
        rad: radiusInMeters.toString()
      })
    }

    console.log("Duffel API response:", response)
    
    // Filter to only include airports and calculate distances
    const airports = response.data
      .filter((place: any) => place.type === "airport")
      .map((airport: any) => ({
        name: airport.name,
        latitude: airport.latitude || 0,
        longitude: airport.longitude || 0,
        distance: calculateDistance(
          latitude,
          longitude,
          airport.latitude || 0,
          airport.longitude || 0
        ),
        airportCode: airport.iata_code,
        placeId: airport.id
      }))
      .sort((a, b) => a.distance - b.distance)

    return {
      isSuccess: true,
      message: `Found ${airports.length} airports`,
      data: airports
    }
  } catch (error) {
    console.error("Error finding airports:", error)
    return {
      isSuccess: false,
      message: "Failed to find airports"
    }
  }
}

// Helper function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
} 