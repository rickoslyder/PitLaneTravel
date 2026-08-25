"use server"

import { db } from "@/db/db"
import { circuitLocationsTable, circuitsTable, racesTable, seriesTable, supportingSeriesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { and, eq, gte, lte, ne, sql } from "drizzle-orm"
import { InsertRace, SelectRace } from "@/db/schema/races-schema"
import { AuthError, requireAdmin } from "@/lib/auth"
import { deriveRaceStatus } from "@/lib/race-status"
import type { RaceStatusValue } from "@/services/providers/types"

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

/** Postgres unique-violation error code. */
const PG_UNIQUE_VIOLATION = "23505"

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === PG_UNIQUE_VIOLATION
  )
}

function projectRaceReadStatus(
  race: {
    status: RaceStatusValue
    date: Date
    weekend_start: Date | null
    weekend_end: Date | null
  },
  now: Date
): RaceStatusValue {
  return deriveRaceStatus(
    {
      status: race.status,
      date: race.date,
      weekendStart: race.weekend_start,
      weekendEnd: race.weekend_end
    },
    now
  )
}

export async function getRacesAction(filters?: {
  year?: number
  startDate?: string
  endDate?: string
  /** Series slug, e.g. "f1", "motogp". Omit for all series. */
  series?: string
  /** Exclude races with status "cancelled" (e.g. for "upcoming" surfaces). */
  excludeCancelled?: boolean
}): Promise<ActionState<RaceWithCircuitAndSeries[]>> {
  try {
    const races = await db
      .select({
        id: racesTable.id,
        circuit_id: racesTable.circuitId,
        series_id: racesTable.seriesId,
        series: {
          id: seriesTable.id,
          name: seriesTable.name,
          short_name: seriesTable.shortName,
          slug: seriesTable.slug,
          event_noun: seriesTable.eventNoun,
          accent_color: seriesTable.accentColor
        },
        name: racesTable.name,
        date: racesTable.date,
        season: racesTable.season,
        round: racesTable.round,
        planned_round: racesTable.plannedRound,
        country: racesTable.country,
        description: racesTable.description,
        cancellation_reason: racesTable.cancellationReason,
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
          timezone_id: circuitsTable.timezoneId,
          timezone_name: circuitsTable.timezoneName,
          website_url: circuitsTable.websiteUrl,
          track_map_url: circuitsTable.trackMapUrl,
          created_at: circuitsTable.createdAt,
          updated_at: circuitsTable.updatedAt
        }
      })
      .from(racesTable)
      .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
      .leftJoin(seriesTable, eq(racesTable.seriesId, seriesTable.id))
      .where(
        and(
          filters?.year ? eq(racesTable.season, filters.year) : undefined,
          filters?.series ? eq(seriesTable.slug, filters.series) : undefined,
          filters?.startDate
            ? gte(racesTable.date, new Date(filters.startDate))
            : undefined,
          filters?.endDate
            ? lte(racesTable.date, new Date(filters.endDate))
            : undefined,
          filters?.excludeCancelled
            ? ne(racesTable.status, "cancelled")
            : undefined
        )
      )
      .orderBy(racesTable.date)

    // Get circuit locations for all circuits.
    // The empty case must short-circuit: `IN ()` is a Postgres syntax error, so any
    // filter matching zero races would otherwise 500 the entire page.
    const circuitIds = races.filter(r => r.circuit).map(r => r.circuit!.id)
    const locations =
      circuitIds.length === 0
        ? []
        : await db
            .select()
            .from(circuitLocationsTable)
            .where(
              sql`${circuitLocationsTable.circuitId} IN (${sql.join(circuitIds, sql`, `)})`
            )

    // Group locations by circuit ID
    const locationsByCircuitId = locations.reduce((acc, location) => {
      if (!acc[location.circuitId]) {
        acc[location.circuitId] = []
      }
      acc[location.circuitId].push(location)
      return acc
    }, {} as Record<string, typeof locations>)

    // Get supporting series for all races (same empty-IN guard as above).
    const raceIds = races.map(r => r.id)
    const supportingSeries =
      raceIds.length === 0
        ? []
        : await db
            .select()
            .from(supportingSeriesTable)
            .where(
              sql`${supportingSeriesTable.raceId} IN (${sql.join(raceIds, sql`, `)})`
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

    const now = new Date()
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
        status: projectRaceReadStatus(race, now),
        circuit: race.circuit ? {
          ...race.circuit,
          latitude: Number(race.circuit.latitude),
          longitude: Number(race.circuit.longitude),
          created_at: race.circuit.created_at.toISOString(),
          updated_at: race.circuit.updated_at.toISOString(),
          website_url: race.circuit.website_url,
          track_map_url: race.circuit.track_map_url,
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
  if (!isUuid(id)) {
    return { isSuccess: false, message: "Invalid race id" }
  }

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
        planned_round: racesTable.plannedRound,
        country: racesTable.country,
        description: racesTable.description,
        cancellation_reason: racesTable.cancellationReason,
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
          track_map_url: circuitsTable.trackMapUrl,
          openf1_key: circuitsTable.openf1Key,
          openf1_short_name: circuitsTable.openf1ShortName,
          timezone_id: circuitsTable.timezoneId,
          timezone_name: circuitsTable.timezoneName,
          website_url: circuitsTable.websiteUrl,
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
    const now = new Date()
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
        status: projectRaceReadStatus(race, now),
        circuit: race.circuit ? {
          ...race.circuit,
          latitude: Number(race.circuit.latitude),
          longitude: Number(race.circuit.longitude),
          created_at: race.circuit.created_at.toISOString(),
          updated_at: race.circuit.updated_at.toISOString(),
          website_url: race.circuit.website_url
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

export async function deleteRaceAction(id: string): Promise<ActionState<void>> {
    try {
    await requireAdmin()
        await db.delete(racesTable).where(eq(racesTable.id, id))
        return {
            isSuccess: true,
            message: "Race deleted successfully",
            data: undefined
        }
    } catch (error) {
        console.error("Error deleting race:", error)
        return {
            isSuccess: false,
            message: "Failed to delete race"
        }
    }
}

export async function createRaceAction(
  data: {
    name: string
    date: Date
    season: number
    round: number
    plannedRound?: number | null
    country: string
    circuitId: string
    /** Championship this race belongs to. Defaults to Formula 1 when omitted. */
    seriesId?: string | null
    description?: string | null
    cancellationReason?: string | null
    weekendStart?: Date | null
    weekendEnd?: Date | null
    status: "in_progress" | "upcoming" | "completed" | "cancelled"
    isSprintWeekend: boolean
    openf1MeetingKey?: number | null
    openf1SessionKey?: number | null
  }
): Promise<ActionState<SelectRace>> {
  try {
    await requireAdmin()

    // races.series_id is NOT NULL; fall back to Formula 1 for callers that predate the
    // multi-series schema rather than failing with a not-null violation.
    let seriesId = data.seriesId
    if (!seriesId) {
      const [f1] = await db
        .select({ id: seriesTable.id })
        .from(seriesTable)
        .where(eq(seriesTable.slug, "f1"))
        .limit(1)
      if (!f1) {
        return {
          isSuccess: false,
          message: "No series found — seed the series table before creating races."
        }
      }
      seriesId = f1.id
    }

    const [newRace] = await db
      .insert(racesTable)
      .values({ ...data, seriesId })
      .returning()
    return {
      isSuccess: true,
      message: "Race created successfully",
      data: newRace
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    if (isUniqueViolation(error)) {
      return {
        isSuccess: false,
        message: `Round ${data.round} is already taken by another race in this series and season. Cancelled races keep their slot — give this race a different round.`
      }
    }
    console.error("Error creating race:", error)
    return { isSuccess: false, message: "Failed to create race" }
  }
}

export async function updateRaceAction(
  id: string,
  data: Partial<{
    name: string
    date: Date
    season: number
    round: number
    plannedRound?: number | null
    country: string
    circuitId: string
    description?: string | null
    cancellationReason?: string | null
    weekendStart?: Date | null
    weekendEnd?: Date | null
    status: "in_progress" | "upcoming" | "completed" | "cancelled"
    isSprintWeekend: boolean
    openf1MeetingKey?: number | null
    openf1SessionKey?: number | null
  }>
): Promise<ActionState<SelectRace>> {
  try {
    await requireAdmin()
    const [updatedRace] = await db
      .update(racesTable)
      .set(data)
      .where(eq(racesTable.id, id))
      .returning()

    return {
      isSuccess: true,
      message: "Race updated successfully",
      data: updatedRace
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return { isSuccess: false, message: error.message }
    }
    if (isUniqueViolation(error)) {
      return {
        isSuccess: false,
        message:
          "That round is already taken by an active race in this series and season. Un-cancelling a race requires giving it a round that isn't already in use."
      }
    }
    console.error("Error updating race:", error)
    return { isSuccess: false, message: "Failed to update race" }
  }
}

export async function getRaceBySlugAction(slug: string): Promise<ActionState<RaceWithCircuitAndSeries>> {
  try {
    console.log("[Races] Getting race by slug:", slug)

    const races = await db
      .select({
        id: racesTable.id,
        circuit_id: racesTable.circuitId,
        name: racesTable.name,
        date: racesTable.date,
        season: racesTable.season,
        round: racesTable.round,
        planned_round: racesTable.plannedRound,
        country: racesTable.country,
        description: racesTable.description,
        cancellation_reason: racesTable.cancellationReason,
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
          track_map_url: circuitsTable.trackMapUrl,
          openf1_key: circuitsTable.openf1Key,
          openf1_short_name: circuitsTable.openf1ShortName,
          timezone_id: circuitsTable.timezoneId,
          timezone_name: circuitsTable.timezoneName,
          website_url: circuitsTable.websiteUrl,
          created_at: circuitsTable.createdAt,
          updated_at: circuitsTable.updatedAt
        }
      })
      .from(racesTable)
      .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
      .where(eq(racesTable.slug, slug))
      .limit(1)

    if (!races || races.length === 0) {
      console.log("[Races] No race found with slug:", slug)
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
    const now = new Date()
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
        status: projectRaceReadStatus(race, now),
        circuit: race.circuit ? {
          ...race.circuit,
          latitude: Number(race.circuit.latitude),
          longitude: Number(race.circuit.longitude),
          created_at: race.circuit.created_at.toISOString(),
          updated_at: race.circuit.updated_at.toISOString(),
          website_url: race.circuit.website_url
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
