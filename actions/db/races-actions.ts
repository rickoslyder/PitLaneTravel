"use server"

import { db } from "@/db/db"
import { circuitsTable, racesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { RaceWithCircuit } from "@/types/database"
import { eq } from "drizzle-orm"
import { sql } from "drizzle-orm"

export async function getRacesAction(filters?: {
  year?: number
  startDate?: string
  endDate?: string
}): Promise<ActionState<RaceWithCircuit[]>> {
  try {
    console.log("[Races] Getting races with filters:", filters)

    const query = db
      .select({
        id: racesTable.id,
        circuit_id: racesTable.circuitId,
        name: racesTable.name,
        date: racesTable.date,
        season: racesTable.season,
        round: racesTable.round,
        country: racesTable.country,
        status: racesTable.status,
        slug: racesTable.slug,
        is_sprint_weekend: racesTable.isSprintWeekend,
        created_at: racesTable.createdAt,
        updated_at: racesTable.updatedAt,
        circuit: {
          id: circuitsTable.id,
          name: circuitsTable.name,
          country: circuitsTable.country,
          location: circuitsTable.location,
          latitude: circuitsTable.latitude,
          longitude: circuitsTable.longitude,
          image_url: circuitsTable.imageUrl,
          created_at: circuitsTable.createdAt,
          updated_at: circuitsTable.updatedAt
        }
      })
      .from(racesTable)
      .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))

    console.log("[Races] Initial query:", query.toSQL())

    const conditions = []

    if (filters?.year) {
      conditions.push(eq(racesTable.season, filters.year))
    }

    if (filters?.startDate) {
      conditions.push(sql`${racesTable.date} >= ${filters.startDate}::date`)
    }

    if (filters?.endDate) {
      conditions.push(sql`${racesTable.date} <= ${filters.endDate}::date`)
    }

    console.log("[Races] Applying conditions:", conditions)

    const races = await query
      .where(conditions.length > 0 ? conditions[0] : undefined)
      .orderBy(racesTable.date)

    console.log("[Races] Query executed successfully")
    console.log("[Races] Number of races found:", races.length)

    return {
      isSuccess: true,
      message: "Races retrieved successfully",
      data: races.map(race => ({
        ...race,
        circuit: race.circuit ? {
          ...race.circuit,
          latitude: Number(race.circuit.latitude),
          longitude: Number(race.circuit.longitude),
          created_at: race.circuit.created_at.toISOString(),
          updated_at: race.circuit.updated_at.toISOString()
        } : null
      }))
    }
  } catch (error) {
    console.error("[Races] Error getting races:", error)
    console.error("[Races] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Races] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[Races] Error stack:", error instanceof Error ? error.stack : "Unknown")

    // Check for specific error types
    if (error instanceof Error) {
      if (error.message.includes("relation") || error.message.includes("column")) {
        console.error("[Races] Database schema error detected")
        return { 
          isSuccess: false, 
          message: "Database schema error. Please ensure the database is properly initialized." 
        }
      }
    }

    return { isSuccess: false, message: "Failed to get races" }
  }
}

export async function getRaceByIdAction(id: string): Promise<ActionState<RaceWithCircuit>> {
  try {
    console.log("[Races] Getting race by ID:", id)

    const races = await db
      .select({
        id: racesTable.id,
        circuit_id: racesTable.circuitId,
        name: racesTable.name,
        date: racesTable.date,
        season: racesTable.season,
        round: racesTable.round,
        country: racesTable.country,
        status: racesTable.status,
        slug: racesTable.slug,
        is_sprint_weekend: racesTable.isSprintWeekend,
        created_at: racesTable.createdAt,
        updated_at: racesTable.updatedAt,
        circuit: {
          id: circuitsTable.id,
          name: circuitsTable.name,
          country: circuitsTable.country,
          location: circuitsTable.location,
          latitude: circuitsTable.latitude,
          longitude: circuitsTable.longitude,
          image_url: circuitsTable.imageUrl,
          created_at: circuitsTable.createdAt,
          updated_at: circuitsTable.updatedAt
        }
      })
      .from(racesTable)
      .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
      .where(eq(racesTable.id, id))
      .limit(1)

    if (!races || races.length === 0) {
      console.log("[Races] No race found with ID:", id)
      return {
        isSuccess: false,
        message: "Race not found"
      }
    }

    const race = races[0]
    console.log("[Races] Race found successfully")
    return {
      isSuccess: true,
      message: "Race retrieved successfully",
      data: {
        ...race,
        circuit: race.circuit ? {
          ...race.circuit,
          latitude: Number(race.circuit.latitude),
          longitude: Number(race.circuit.longitude),
          created_at: race.circuit.created_at.toISOString(),
          updated_at: race.circuit.updated_at.toISOString()
        } : null
      }
    }
  } catch (error) {
    console.error("[Races] Error getting race:", error)
    console.error("[Races] Error name:", error instanceof Error ? error.name : "Unknown")
    console.error("[Races] Error message:", error instanceof Error ? error.message : "Unknown")
    console.error("[Races] Error stack:", error instanceof Error ? error.stack : "Unknown")
    return { isSuccess: false, message: "Failed to get race" }
  }
}
