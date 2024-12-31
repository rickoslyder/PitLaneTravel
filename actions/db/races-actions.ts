"use server"

import { db } from "@/db/db"
import { circuitLocationsTable, circuitsTable, racesTable, supportingSeriesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { eq, sql } from "drizzle-orm"

export async function getRacesAction(filters?: {
  year?: number
  startDate?: string
  endDate?: string
}): Promise<ActionState<RaceWithCircuitAndSeries[]>> {
  try {
    console.log("[Races] Getting races with filters:", filters)

    const races = await db
      .select({
        id: racesTable.id,
        circuit_id: racesTable.circuitId,
        name: racesTable.name,
        date: racesTable.date,
        season: racesTable.season,
        round: racesTable.round,
        country: racesTable.country,
        description: racesTable.description,
        weekend_start: racesTable.weekendStart,
        weekend_end: racesTable.weekendEnd,
        status: racesTable.status,
        slug: racesTable.slug,
        is_sprint_weekend: racesTable.isSprintWeekend,
        openf1_meeting_key: racesTable.openf1MeetingKey,
        openf1_session_key: racesTable.openf1SessionKey,
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
          openf1_key: circuitsTable.openf1Key,
          openf1_short_name: circuitsTable.openf1ShortName,
          created_at: circuitsTable.createdAt,
          updated_at: circuitsTable.updatedAt
        }
      })
      .from(racesTable)
      .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
      .where(filters?.year ? eq(racesTable.season, filters.year) : undefined)
      .orderBy(racesTable.date)

    // Get circuit locations for all circuits
    const locations = await db
      .select()
      .from(circuitLocationsTable)
      .where(
        sql`${circuitLocationsTable.circuitId} IN (${sql.join(
          races.filter(r => r.circuit).map(r => r.circuit!.id),
          sql`, `
        )})`
      )

    // Group locations by circuit ID
    const locationsByCircuitId = locations.reduce((acc, location) => {
      if (!acc[location.circuitId]) {
        acc[location.circuitId] = []
      }
      acc[location.circuitId].push(location)
      return acc
    }, {} as Record<string, typeof locations>)

    // Get supporting series for all races
    const supportingSeries = await db
      .select()
      .from(supportingSeriesTable)
      .where(
        sql`${supportingSeriesTable.raceId} IN (${sql.join(
          races.map(r => r.id),
          sql`, `
        )})`
      )

    // Group supporting series by race ID
    const seriesByRaceId = supportingSeries.reduce((acc, series) => {
      if (!acc[series.raceId]) {
        acc[series.raceId] = []
      }
      acc[series.raceId].push({
        ...series,
        created_at: series.createdAt.toISOString(),
        updated_at: series.updatedAt.toISOString(),
        start_time: series.startTime?.toISOString() || null,
        end_time: series.endTime?.toISOString() || null,
        race_id: series.raceId,
        openf1_session_key: series.openf1SessionKey
      })
      return acc
    }, {} as Record<string, any[]>)

    return {
      isSuccess: true,
      message: "Races retrieved successfully",
      data: races.map(race => ({
        ...race,
        date: race.date.toISOString(),
        created_at: race.created_at.toISOString(),
        updated_at: race.updated_at.toISOString(),
        weekend_start: race.weekend_start?.toISOString() || null,
        weekend_end: race.weekend_end?.toISOString() || null,
        status: race.status === "live" ? "in_progress" : race.status,
        circuit: race.circuit ? {
          ...race.circuit,
          latitude: Number(race.circuit.latitude),
          longitude: Number(race.circuit.longitude),
          created_at: race.circuit.created_at.toISOString(),
          updated_at: race.circuit.updated_at.toISOString(),
          locations: locationsByCircuitId[race.circuit.id] || []
        } : null,
        supporting_series: seriesByRaceId[race.id] || []
      }))
    }
  } catch (error) {
    console.error("[Races] Error getting races:", error)
    return { isSuccess: false, message: "Failed to get races" }
  }
}

export async function getRaceByIdAction(id: string): Promise<ActionState<RaceWithCircuitAndSeries>> {
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
        description: racesTable.description,
        weekend_start: racesTable.weekendStart,
        weekend_end: racesTable.weekendEnd,
        status: racesTable.status,
        slug: racesTable.slug,
        is_sprint_weekend: racesTable.isSprintWeekend,
        openf1_meeting_key: racesTable.openf1MeetingKey,
        openf1_session_key: racesTable.openf1SessionKey,
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
          openf1_key: circuitsTable.openf1Key,
          openf1_short_name: circuitsTable.openf1ShortName,
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

    // Get supporting series for the race
    const supportingSeries = await db
      .select()
      .from(supportingSeriesTable)
      .where(eq(supportingSeriesTable.raceId, race.id))

    console.log("[Races] Race found successfully")
    return {
      isSuccess: true,
      message: "Race retrieved successfully",
      data: {
        ...race,
        date: race.date.toISOString(),
        created_at: race.created_at.toISOString(),
        updated_at: race.updated_at.toISOString(),
        weekend_start: race.weekend_start?.toISOString() || null,
        weekend_end: race.weekend_end?.toISOString() || null,
        status: race.status === "live" ? "in_progress" : race.status,
        circuit: race.circuit ? {
          ...race.circuit,
          latitude: Number(race.circuit.latitude),
          longitude: Number(race.circuit.longitude),
          created_at: race.circuit.created_at.toISOString(),
          updated_at: race.circuit.updated_at.toISOString()
        } : null,
        supporting_series: supportingSeries.map(series => ({
          ...series,
          created_at: series.createdAt.toISOString(),
          updated_at: series.updatedAt.toISOString(),
          start_time: series.startTime?.toISOString() || null,
          end_time: series.endTime?.toISOString() || null,
          race_id: series.raceId,
          openf1_session_key: series.openf1SessionKey
        }))
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
