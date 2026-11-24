import { isUtcDateOnlyInstant } from "@/lib/race-datetime"
import type { RaceStatusValue } from "@/services/providers/types"

const DAY_MS = 24 * 60 * 60 * 1000
const INVALID_TIMESTAMPS = "Invalid race status timestamps"

export type RaceStatusFields = {
  status?: RaceStatusValue | null
  date: Date
  weekendStart?: Date | null
  weekendEnd?: Date | null
}

function epochMs(value: Date): number {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(INVALID_TIMESTAMPS)
  }
  return value.getTime()
}

export function deriveRaceStatus(
  race: RaceStatusFields,
  now: Date
): RaceStatusValue {
  if (race.status === "cancelled") return "cancelled"

  const nowMs = epochMs(now)
  const dateMs = epochMs(race.date)
  const startMs =
    race.weekendStart != null ? epochMs(race.weekendStart) : dateMs
  const endMs =
    race.weekendEnd != null ? epochMs(race.weekendEnd) : dateMs + DAY_MS

  if (endMs < startMs) {
    throw new Error("Race status end is earlier than start")
  }

  if (nowMs < startMs) return "upcoming"
  if (nowMs < endMs) return "in_progress"
  return "completed"
}

export function isActiveRaceStatus(status: RaceStatusValue): boolean {
  return status === "upcoming" || status === "in_progress"
}

export type CountdownRaceFields = {
  status: RaceStatusValue
  date: Date | string
  weekendEnd?: Date | string | null
  weekend_end?: Date | string | null
  timeZone?: string | null
  timezone_id?: string | null
  circuit?: { timezone_id?: string | null } | null
}

function instantMs(value: Date | string | null | undefined): number | null {
  if (value == null || value === "") return null
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : null
}

function zoneOffsetMs(timeZone: string, utcMs: number): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    }).formatToParts(new Date(utcMs))
    const bag: Record<string, string> = {}
    for (const part of parts) {
      if (part.type !== "literal") bag[part.type] = part.value
    }
    const asUtc = Date.UTC(
      Number(bag.year),
      Number(bag.month) - 1,
      Number(bag.day),
      Number(bag.hour) % 24,
      Number(bag.minute),
      Number(bag.second)
    )
    return asUtc - utcMs
  } catch {
    return null
  }
}

/** Midnight at the start of the next UTC calendar date, in `timeZone`. */
function endOfUtcCalendarDayMs(
  dateMs: number,
  timeZone: string
): number | null {
  const date = new Date(dateMs)
  const next = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  )
  const guess = Date.UTC(
    next.getUTCFullYear(),
    next.getUTCMonth(),
    next.getUTCDate()
  )
  const offset = zoneOffsetMs(timeZone, guess)
  if (offset == null) return null
  let utc = guess - offset
  const corrected = zoneOffsetMs(timeZone, utc)
  if (corrected == null) return null
  if (corrected !== offset) utc = guess - corrected
  return utc
}

function countdownZone(race: CountdownRaceFields): string | null {
  const zone =
    race.timeZone ?? race.timezone_id ?? race.circuit?.timezone_id ?? null
  if (!zone) return null
  return zoneOffsetMs(zone, Date.UTC(2026, 0, 1)) == null ? null : zone
}

/**
 * When the weekend is over. An explicit end wins. A date-only midnight is the
 * UTC calendar day and finishes at the end of that day in the circuit zone,
 * or at the next UTC midnight when the zone is missing. A real start instant
 * finishes 24 hours later.
 */
export function countdownWeekendEndMs(
  race: CountdownRaceFields
): number | null {
  const explicit = instantMs(race.weekendEnd ?? race.weekend_end)
  if (explicit != null) return explicit
  const dateMs = instantMs(race.date)
  if (dateMs == null) return null
  if (!isUtcDateOnlyInstant(new Date(dateMs))) return dateMs + DAY_MS
  const zone = countdownZone(race)
  if (!zone) return dateMs + DAY_MS
  return endOfUtcCalendarDayMs(dateMs, zone) ?? dateMs + DAY_MS
}

export function isOpenCountdownRace(
  race: CountdownRaceFields,
  now: Date
): boolean {
  if (!isActiveRaceStatus(race.status)) return false
  const nowMs = now.getTime()
  if (!Number.isFinite(nowMs)) return false
  const dateMs = instantMs(race.date)
  // race.date is the countdown target. Once it has passed, the timer stops.
  if (dateMs == null || dateMs <= nowMs) return false
  const endMs = countdownWeekendEndMs(race)
  if (endMs == null || endMs <= nowMs) return false
  return true
}

export function selectNextCountdownRace<T extends CountdownRaceFields>(
  races: readonly T[],
  now: Date
): T | undefined {
  let best: T | undefined
  let bestDate = Infinity
  for (const race of races) {
    if (!isOpenCountdownRace(race, now)) continue
    const dateMs = instantMs(race.date)
    if (dateMs == null || dateMs >= bestDate) continue
    best = race
    bestDate = dateMs
  }
  return best
}
