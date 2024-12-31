"use server"

import { db } from "@/db/db"
import {
  InsertCircuit,
  SelectCircuit,
  circuitsTable,
  InsertCircuitDetails,
  SelectCircuitDetails,
  circuitDetailsTable,
  InsertAirport,
  SelectAirport,
  airportsTable,
  InsertLocalAttraction,
  SelectLocalAttraction,
  localAttractionsTable,
  transportInfoTable,
  circuitLocationsTable,
  SelectCircuitLocation,
  racesTable
} from "@/db/schema"
import { ActionState } from "@/types"
import { eq, and, desc } from "drizzle-orm"
import { getCircuitLocationsAction } from "./circuit-locations-actions"

// Circuit Actions
export async function createCircuitAction(
  data: InsertCircuit
): Promise<ActionState<SelectCircuit>> {
  try {
    const [newCircuit] = await db.insert(circuitsTable).values(data).returning()
    return {
      isSuccess: true,
      message: "Circuit created successfully",
      data: newCircuit
    }
  } catch (error) {
    console.error("Error creating circuit:", error)
    return { isSuccess: false, message: "Failed to create circuit" }
  }
}

export async function getCircuitAction(
  id: string
): Promise<ActionState<SelectCircuit>> {
  try {
    const [circuit] = await db
      .select()
      .from(circuitsTable)
      .where(eq(circuitsTable.id, id))

    if (!circuit) {
      return { isSuccess: false, message: "Circuit not found" }
    }

    return {
      isSuccess: true,
      message: "Circuit retrieved successfully",
      data: circuit
    }
  } catch (error) {
    console.error("Error getting circuit:", error)
    return { isSuccess: false, message: "Failed to get circuit" }
  }
}

export async function getCircuitsAction(): Promise<ActionState<SelectCircuit[]>> {
  try {
    const circuits = await db
      .select()
      .from(circuitsTable)
      .orderBy(desc(circuitsTable.name))

    return {
      isSuccess: true,
      message: "Circuits retrieved successfully",
      data: circuits
    }
  } catch (error) {
    console.error("Error getting circuits:", error)
    return { isSuccess: false, message: "Failed to get circuits" }
  }
}

export async function updateCircuitAction(
  id: string,
  data: Partial<InsertCircuit>
): Promise<ActionState<SelectCircuit>> {
  try {
    const [updatedCircuit] = await db
      .update(circuitsTable)
      .set(data)
      .where(eq(circuitsTable.id, id))
      .returning()

    if (!updatedCircuit) {
      return { isSuccess: false, message: "Circuit not found" }
    }

    return {
      isSuccess: true,
      message: "Circuit updated successfully",
      data: updatedCircuit
    }
  } catch (error) {
    console.error("Error updating circuit:", error)
    return { isSuccess: false, message: "Failed to update circuit" }
  }
}

// Circuit Details Actions
export async function createCircuitDetailsAction(
  data: InsertCircuitDetails
): Promise<ActionState<SelectCircuitDetails>> {
  try {
    const [newDetails] = await db
      .insert(circuitDetailsTable)
      .values(data)
      .returning()
    return {
      isSuccess: true,
      message: "Circuit details created successfully",
      data: newDetails
    }
  } catch (error) {
    console.error("Error creating circuit details:", error)
    return { isSuccess: false, message: "Failed to create circuit details" }
  }
}

export async function getCircuitDetailsAction(
  circuitId: string
): Promise<ActionState<SelectCircuitDetails>> {
  try {
    const [details] = await db
      .select()
      .from(circuitDetailsTable)
      .where(eq(circuitDetailsTable.circuitId, circuitId))
      .limit(1)

    if (!details) {
      return {
        isSuccess: false,
        message: "Circuit details not found"
      }
    }

    return {
      isSuccess: true,
      message: "Circuit details retrieved successfully",
      data: details
    }
  } catch (error) {
    console.error("Error getting circuit details:", error)
    return { isSuccess: false, message: "Failed to get circuit details" }
  }
}

// Circuit Airport Actions
export async function createCircuitAirportAction(
  data: InsertAirport
): Promise<ActionState<SelectAirport>> {
  try {
    const [newAirport] = await db.insert(airportsTable).values(data).returning()
    return {
      isSuccess: true,
      message: "Circuit airport created successfully",
      data: newAirport
    }
  } catch (error) {
    console.error("Error creating circuit airport:", error)
    return { isSuccess: false, message: "Failed to create circuit airport" }
  }
}

export async function getCircuitAirportsAction(
  circuitId: string
): Promise<ActionState<SelectCircuitLocation[]>> {
  try {
    const airports = await db
      .select()
      .from(circuitLocationsTable)
      .where(
        and(
          eq(circuitLocationsTable.circuitId, circuitId),
          eq(circuitLocationsTable.type, "airport")
        )
      )

    return {
      isSuccess: true,
      message: "Circuit airports retrieved successfully",
      data: airports
    }
  } catch (error) {
    console.error("Error getting circuit airports:", error)
    return { isSuccess: false, message: "Failed to get circuit airports" }
  }
}

// Circuit Attraction Actions
export async function createCircuitAttractionAction(
  data: InsertLocalAttraction
): Promise<ActionState<SelectLocalAttraction>> {
  try {
    const [newAttraction] = await db
      .insert(localAttractionsTable)
      .values(data)
      .returning()
    return {
      isSuccess: true,
      message: "Circuit attraction created successfully",
      data: newAttraction
    }
  } catch (error) {
    console.error("Error creating circuit attraction:", error)
    return { isSuccess: false, message: "Failed to create circuit attraction" }
  }
}

export async function getCircuitAttractionsAction(
  circuitId: string
): Promise<ActionState<SelectLocalAttraction[]>> {
  try {
    const attractions = await db
      .select()
      .from(localAttractionsTable)
      .where(eq(localAttractionsTable.circuitId, circuitId))

    return {
      isSuccess: true,
      message: "Circuit attractions retrieved successfully",
      data: attractions
    }
  } catch (error) {
    console.error("Error getting circuit attractions:", error)
    return { isSuccess: false, message: "Failed to get circuit attractions" }
  }
}

// Get Circuit with All Details
export async function getCircuitWithDetailsAction(
  id: string
): Promise<ActionState<SelectCircuit & {
  details?: SelectCircuitDetails
  airports?: SelectAirport[]
  local_attractions?: SelectLocalAttraction[]
  transport_info?: any[]
  locations?: SelectCircuitLocation[]
}>> {
  try {
    // Get circuit
    const circuitResult = await getCircuitAction(id)
    if (!circuitResult.isSuccess) {
      return circuitResult
    }

    // Get circuit details
    const detailsResult = await getCircuitDetailsAction(id)
    const details = detailsResult.isSuccess ? detailsResult.data : undefined

    // Get airports from circuit_locations
    const airportsResult = await getCircuitAirportsAction(id)
    const airports = airportsResult.isSuccess
      ? airportsResult.data.map(location => ({
          id: location.id,
          circuitId: location.circuitId,
          code: location.placeId || "",
          name: location.name,
          distance: location.distanceFromCircuit?.toString() || "0",
          transferTime: location.description || "Unknown",
          latitude: location.latitude.toString(),
          longitude: location.longitude.toString(),
          createdAt: location.createdAt,
          updatedAt: location.updatedAt
        }))
      : undefined

    // Get circuit locations
    const locationsResult = await getCircuitLocationsAction(id)
    const locations = locationsResult.isSuccess ? locationsResult.data : undefined

    // Get local attractions
    const attractionsResult = await getCircuitAttractionsAction(id)
    const attractions = attractionsResult.isSuccess ? attractionsResult.data : undefined

    // Get transport info
    const transportInfo = await db
      .select()
      .from(transportInfoTable)
      .where(eq(transportInfoTable.circuitId, id))

    return {
      isSuccess: true,
      message: "Circuit with details retrieved successfully",
      data: {
        ...circuitResult.data,
        details,
        airports,
        locations,
        local_attractions: attractions,
        transport_info: transportInfo
      }
    }
  } catch (error) {
    console.error("Error getting circuit with details:", error)
    return { isSuccess: false, message: "Failed to get circuit with details" }
  }
}

export async function updateCircuitCoordinatesAction(
  circuitId: string,
  latitude: number,
  longitude: number
): Promise<ActionState<void>> {
  try {
    await db
      .update(circuitsTable)
      .set({
        latitude: latitude.toString(),
        longitude: longitude.toString()
      })
      .where(eq(circuitsTable.id, circuitId))

    return {
      isSuccess: true,
      message: "Circuit coordinates updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating circuit coordinates:", error)
    return { isSuccess: false, message: "Failed to update circuit coordinates" }
  }
}

// For Jeddah specifically
export async function fixJeddahCoordinatesAction(): Promise<ActionState<void>> {
  try {
    const [circuit] = await db
      .select()
      .from(circuitsTable)
      .where(eq(circuitsTable.name, "Jeddah Corniche Circuit"))
      .limit(1)

    if (!circuit) {
      return { isSuccess: false, message: "Jeddah circuit not found" }
    }

    // Correct coordinates for Jeddah Corniche Circuit
    await db
      .update(circuitsTable)
      .set({
        latitude: "21.6319",
        longitude: "39.1044"
      })
      .where(eq(circuitsTable.id, circuit.id))

    return {
      isSuccess: true,
      message: "Jeddah circuit coordinates fixed",
      data: undefined
    }
  } catch (error) {
    console.error("Error fixing Jeddah coordinates:", error)
    return { isSuccess: false, message: "Failed to fix Jeddah coordinates" }
  }
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY

export async function updateCircuitTimezoneAction(
  circuitId: string,
  timestamp: Date
): Promise<ActionState<void>> {
  try {
    // Get circuit details
    const [circuit] = await db
      .select({
        id: circuitsTable.id,
        latitude: circuitsTable.latitude,
        longitude: circuitsTable.longitude
      })
      .from(circuitsTable)
      .where(eq(circuitsTable.id, circuitId))
      .limit(1)

    if (!circuit) {
      return {
        isSuccess: false,
        message: "Circuit not found"
      }
    }

    // Get timezone from Google Maps API
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${circuit.latitude},${circuit.longitude}&timestamp=${Math.floor(
        timestamp.getTime() / 1000
      )}&key=${GOOGLE_MAPS_API_KEY}`
    )

    if (!response.ok) {
      throw new Error("Failed to fetch timezone data")
    }

    const data = await response.json()

    if (data.status !== "OK") {
      throw new Error(`Google Maps API error: ${data.status}`)
    }

    // Update circuit with timezone info
    await db
      .update(circuitsTable)
      .set({
        timezoneId: data.timeZoneId,
        timezoneName: data.timeZoneName
      })
      .where(eq(circuitsTable.id, circuitId))

    return {
      isSuccess: true,
      message: "Circuit timezone updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating circuit timezone:", error)
    return {
      isSuccess: false,
      message: "Failed to update circuit timezone"
    }
  }
}

export async function updateAllCircuitTimezonesAction(): Promise<ActionState<void>> {
  try {
    // Get all circuits with their races
    const circuits = await db
      .select({
        circuit: circuitsTable,
        race: racesTable
      })
      .from(circuitsTable)
      .leftJoin(racesTable, eq(circuitsTable.id, racesTable.circuitId))

    // Group races by circuit
    const circuitMap = circuits.reduce((acc, row) => {
      if (!acc[row.circuit.id]) {
        acc[row.circuit.id] = {
          circuit: row.circuit,
          races: []
        }
      }
      if (row.race) {
        acc[row.circuit.id].races.push(row.race)
      }
      return acc
    }, {} as Record<string, { circuit: typeof circuitsTable.$inferSelect, races: typeof racesTable.$inferSelect[] }>)

    // Update each circuit
    for (const { circuit, races } of Object.values(circuitMap)) {
      // Use the first race date as reference, or current date if no races
      const referenceDate = races[0]?.date || new Date()
      await updateCircuitTimezoneAction(circuit.id, referenceDate)
    }

    return {
      isSuccess: true,
      message: "All circuit timezones updated successfully",
      data: undefined
    }
  } catch (error) {
    console.error("Error updating all circuit timezones:", error)
    return {
      isSuccess: false,
      message: "Failed to update all circuit timezones"
    }
  }
}
