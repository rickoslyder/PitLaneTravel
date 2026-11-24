import { deriveRaceStatus } from "@/lib/race-status"
import { slugify } from "@/lib/series"
import type { RaceStatusValue } from "@/services/providers/types"

/** Visible grandstand-page button. Opens the race tickets tab. */
export const TICKETS_FOR_THIS_RACE_LABEL = "Tickets for this race"

/** Shown with the tickets link. PitLane does not take payment for the seat. */
export const GRANDSTAND_TICKETS_NOTE = "PitLane Travel does not sell tickets."

/** Race-page link to the circuit grandstand guide. */
export const WHERE_TO_SIT_LABEL = "Where to sit"

const PATH_SEGMENT = /^[A-Za-z0-9-]+$/

/**
 * Published grandstand notes describe Formula 1 seating. A guide uses another
 * series only when that series is named explicitly.
 */
export const GRANDSTAND_NOTES_SERIES_SLUG = "f1"

export type CircuitRaceCandidate = {
  id: string
  name: string
  slug: string | null
  seriesSlug: string | null
  date: Date
  status: RaceStatusValue
  weekendStart: Date | null
  weekendEnd: Date | null
}

export type UpcomingRaceLink = {
  name: string
  href: string
  ticketsHref: string
}

function isRealDate(value: Date | null | undefined): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime())
}

function openStatus(
  race: CircuitRaceCandidate,
  now: Date
): "upcoming" | "in_progress" | null {
  if (!isRealDate(race.date)) return null
  if (race.weekendStart != null && !isRealDate(race.weekendStart)) return null
  if (race.weekendEnd != null && !isRealDate(race.weekendEnd)) return null
  try {
    const status = deriveRaceStatus(
      {
        status: race.status,
        date: race.date,
        weekendStart: race.weekendStart,
        weekendEnd: race.weekendEnd
      },
      now
    )
    return status === "upcoming" || status === "in_progress" ? status : null
  } catch {
    return null
  }
}

function startMs(race: CircuitRaceCandidate): number {
  return (race.weekendStart ?? race.date).getTime()
}

/**
 * Races a visitor can still attend at this circuit, soonest start first.
 * A live weekend stays ahead of a later race. Cancelled and finished weekends drop out.
 */
export function rankOpenRaces(
  races: readonly CircuitRaceCandidate[],
  now: Date
): CircuitRaceCandidate[] {
  return races
    .filter(race => openStatus(race, now) != null)
    .sort((a, b) => {
      const delta = startMs(a) - startMs(b)
      if (delta !== 0) return delta
      return a.name.localeCompare(b.name)
    })
}

export function partOfRaceGuideLabel(raceName: string): string {
  return `Part of the ${raceName} guide`
}

export function racePagePath(race: {
  id: string
  slug: string | null
}): string | null {
  const slug = race.slug?.trim() ?? ""
  const segment = PATH_SEGMENT.test(slug)
    ? slug
    : PATH_SEGMENT.test(race.id)
      ? race.id
      : null
  if (!segment) return null
  return `/races/${segment}`
}

export function raceTicketsPath(race: {
  id: string
  slug: string | null
}): string | null {
  const page = racePagePath(race)
  if (!page) return null
  return `${page}?tab=tickets`
}

export function grandstandPagePath(circuitName: string): string | null {
  const slug = slugify(circuitName)
  if (!PATH_SEGMENT.test(slug)) return null
  return `/circuits/${slug}/grandstands`
}

export function grandstandHrefForCircuit(
  circuitName: string,
  grandstandCount: number
): string | null {
  if (!Number.isInteger(grandstandCount) || grandstandCount < 1) return null
  return grandstandPagePath(circuitName)
}

/** Series the seating notes belong to. Unspecified notes stay on Formula 1. */
export function grandstandNotesSeriesSlug(
  explicitSeriesSlug?: string | null
): string {
  const slug = explicitSeriesSlug?.trim().toLowerCase() ?? ""
  return slug && PATH_SEGMENT.test(slug) ? slug : GRANDSTAND_NOTES_SERIES_SLUG
}

function raceMatchesNotes(
  race: CircuitRaceCandidate,
  notesSeriesSlug: string
): boolean {
  return (race.seriesSlug ?? "").trim().toLowerCase() === notesSeriesSlug
}

/**
 * Soonest open race for the series these grandstand notes describe.
 * Formula 1 unless a series is passed explicitly. No cross-series fallback.
 */
export function upcomingRaceLink(
  races: readonly CircuitRaceCandidate[],
  now: Date,
  options?: { seriesSlug?: string | null }
): UpcomingRaceLink | null {
  const notesSeriesSlug = grandstandNotesSeriesSlug(options?.seriesSlug)
  const matching = races.filter(race => raceMatchesNotes(race, notesSeriesSlug))
  for (const race of rankOpenRaces(matching, now)) {
    const name = race.name.trim()
    if (!name) continue
    const href = racePagePath(race)
    const ticketsHref = raceTicketsPath(race)
    if (!href || !ticketsHref) continue
    return { name, href, ticketsHref }
  }
  return null
}

/** Grandstand guide link for a race page. Hidden unless the race's series matches the notes. */
export function grandstandHrefForRace(input: {
  circuitName: string
  grandstandCount: number
  raceSeriesSlug: string | null | undefined
  notesSeriesSlug?: string | null
}): string | null {
  const notes = grandstandNotesSeriesSlug(input.notesSeriesSlug)
  const raceSeries = input.raceSeriesSlug?.trim().toLowerCase() ?? ""
  if (raceSeries !== notes) return null
  return grandstandHrefForCircuit(input.circuitName, input.grandstandCount)
}
