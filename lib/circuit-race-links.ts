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

export type CircuitRaceCandidate = {
  id: string
  name: string
  slug: string | null
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

/** Soonest open race, as internal guide and tickets-tab paths. */
export function upcomingRaceLink(
  races: readonly CircuitRaceCandidate[],
  now: Date
): UpcomingRaceLink | null {
  for (const race of rankOpenRaces(races, now)) {
    const name = race.name.trim()
    if (!name) continue
    const href = racePagePath(race)
    const ticketsHref = raceTicketsPath(race)
    if (!href || !ticketsHref) continue
    return { name, href, ticketsHref }
  }
  return null
}
