import { Client } from "@googlemaps/google-maps-services-js"
import { db } from "@/db/db"
import { circuitsTable, circuitLocationsTable } from "@/db/schema"
import type { InsertCircuitLocation } from "@/db/schema"
import { eq } from "drizzle-orm"
import { calculateDistance } from "@/lib/utils"

if (!process.env.GOOGLE_MAPS_API_KEY) {
  throw new Error("GOOGLE_MAPS_API_KEY is required")
}

const client = new Client({})

async function findCityCenter(location: string) {
  try {
    // Use Places API Text Search to find the city center
    const response = await client.textSearch({
      params: {
        query: `${location} city center`,
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    })

    if (response.data.status !== "OK" || !response.data.results.length) {
      throw new Error(`No results found for ${location}`)
    }

    const place = response.data.results[0]
    if (!place.geometry?.location) {
      throw new Error(`No location data found for ${location}`)
    }

    // Get timezone for the location
    const timezoneResponse = await client.timezone({
      params: {
        location: place.geometry.location,
        timestamp: Math.floor(Date.now() / 1000),
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    })

    return {
      name: place.name || location,
      description: place.formatted_address,
      address: place.formatted_address,
      placeId: place.place_id,
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
      timezone: timezoneResponse.data.timeZoneId
    }
  } catch (error) {
    console.error(`Error finding city center for ${location}:`, error)
    return null
  }
}

async function migrateCircuitLocations() {
  try {
    // Get all circuits
    const circuits = await db.select().from(circuitsTable)
    console.log(`Found ${circuits.length} circuits to process`)

    for (const circuit of circuits) {
      console.log(`Processing ${circuit.name}...`)

      // 1. Create circuit location
      const circuitLocation: InsertCircuitLocation = {
        circuitId: circuit.id,
        type: "circuit",
        name: circuit.name,
        description: `F1 Circuit: ${circuit.name}`,
        address: circuit.location,
        latitude: circuit.latitude,
        longitude: circuit.longitude,
        distanceFromCircuit: "0"
      }
      await db.insert(circuitLocationsTable).values(circuitLocation)
      console.log(`Created circuit location for ${circuit.name}`)

      // 2. Find and create city center location
      const cityCenter = await findCityCenter(circuit.location)
      if (cityCenter) {
        const distanceFromCircuit = calculateDistance(
          Number(circuit.latitude),
          Number(circuit.longitude),
          cityCenter.latitude,
          cityCenter.longitude
        ).toFixed(2)

        const cityCenterLocation: InsertCircuitLocation = {
          circuitId: circuit.id,
          type: "city_center",
          name: cityCenter.name,
          description: cityCenter.description,
          address: cityCenter.address,
          placeId: cityCenter.placeId,
          latitude: cityCenter.latitude.toString(),
          longitude: cityCenter.longitude.toString(),
          distanceFromCircuit,
          timezone: cityCenter.timezone
        }
        await db.insert(circuitLocationsTable).values(cityCenterLocation)
        console.log(`Created city center location for ${circuit.name}`)
      } else {
        console.warn(`Could not find city center for ${circuit.name}`)
      }
    }

    console.log("Migration completed successfully")
  } catch (error) {
    console.error("Migration failed:", error)
    process.exit(1)
  }
}

// Don't run the migration automatically
// To run: ts-node scripts/migrate-circuit-locations.ts
if (require.main === module) {
  console.log("This script should be run manually after review")
  console.log("To run: ts-node scripts/migrate-circuit-locations.ts")
} 