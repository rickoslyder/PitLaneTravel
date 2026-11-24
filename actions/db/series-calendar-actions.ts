"use server"

import { unstable_cache } from "next/cache"
import { db } from "@/db/db"
import { circuitsTable } from "@/db/schema/circuits-schema"
import { racesTable } from "@/db/schema/races-schema"
import { seriesTable } from "@/db/schema/series-schema"
import { ticketPackagesTable } from "@/db/schema/ticket-packages-schema"
import { ticketsTable } from "@/db/schema/tickets-schema"
import { deriveRaceStatus } from "@/lib/race-status"
import type { SeriesCalendarRace } from "@/lib/series-card-image"
import type { ActionState } from "@/types"
import { and, eq, inArray, ne } from "drizzle-orm"

export type SeriesCalendar = {
  races: SeriesCalendarRace[]
}

/**
 * Card fields for one series. Skips circuit locations and supporting series,
 * which the series grid does not render.
 */
async function querySeriesCalendar(
  slug: string
): Promise<SeriesCalendarRace[]> {
  const rows = await db
    .select({
      id: racesTable.id,
      name: racesTable.name,
      slug: racesTable.slug,
      date: racesTable.date,
      season: racesTable.season,
      country: racesTable.country,
      status: racesTable.status,
      weekendStart: racesTable.weekendStart,
      weekendEnd: racesTable.weekendEnd,
      cancellationReason: racesTable.cancellationReason,
      seriesShortName: seriesTable.shortName,
      seriesSlug: seriesTable.slug,
      seriesAccent: seriesTable.accentColor,
      circuitName: circuitsTable.name,
      circuitLocation: circuitsTable.location,
      circuitCountry: circuitsTable.country,
      circuitImage: circuitsTable.imageUrl,
      circuitTimezone: circuitsTable.timezoneId
    })
    .from(racesTable)
    .innerJoin(seriesTable, eq(racesTable.seriesId, seriesTable.id))
    .leftJoin(circuitsTable, eq(racesTable.circuitId, circuitsTable.id))
    .where(and(eq(seriesTable.slug, slug), ne(racesTable.status, "cancelled")))
    .orderBy(racesTable.date)

  const now = new Date()
  const races: SeriesCalendarRace[] = rows.map(row => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    date: row.date.toISOString(),
    season: row.season,
    country: row.country,
    status: deriveRaceStatus(
      {
        status: row.status,
        date: row.date,
        weekendStart: row.weekendStart,
        weekendEnd: row.weekendEnd
      },
      now
    ),
    weekend_end: row.weekendEnd?.toISOString() ?? null,
    cancellation_reason: row.cancellationReason,
    series: row.seriesShortName
      ? {
          short_name: row.seriesShortName,
          slug: row.seriesSlug,
          accent_color: row.seriesAccent
        }
      : null,
    circuit: row.circuitName
      ? {
          name: row.circuitName,
          location: row.circuitLocation ?? "",
          country: row.circuitCountry ?? "",
          image_url: row.circuitImage,
          timezone_id: row.circuitTimezone
        }
      : null
  }))

  return races
}

const loadCachedSeriesCalendar = unstable_cache(
  querySeriesCalendar,
  ["series-calendar"],
  { revalidate: 300 }
)

export async function getSeriesCalendarAction(
  slug: string
): Promise<ActionState<SeriesCalendar>> {
  try {
    const races = await loadCachedSeriesCalendar(slug)
    return {
      isSuccess: true,
      message: "Series calendar retrieved",
      data: { races }
    }
  } catch (error) {
    console.error("Error loading series calendar:", error)
    return { isSuccess: false, message: "Failed to load series calendar" }
  }
}

/** Null when the lookup fails, so cards keep View Details. */
export async function listSeriesTicketedRaceIdsAction(
  raceIds: string[]
): Promise<string[] | null> {
  if (raceIds.length === 0) return []
  try {
    const [ticketRows, packageRows] = await Promise.all([
      db
        .selectDistinct({ raceId: ticketsTable.raceId })
        .from(ticketsTable)
        .where(inArray(ticketsTable.raceId, raceIds)),
      db
        .selectDistinct({ raceId: ticketPackagesTable.raceId })
        .from(ticketPackagesTable)
        .where(inArray(ticketPackagesTable.raceId, raceIds))
    ])
    const ids = new Set<string>()
    for (const row of ticketRows) ids.add(row.raceId)
    for (const row of packageRows) ids.add(row.raceId)
    return [...ids]
  } catch (error) {
    console.error("Error listing series ticket rows:", error)
    return null
  }
}
