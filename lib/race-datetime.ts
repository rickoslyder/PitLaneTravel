/**
 * Race calendar dates are stored as instants at UTC midnight of the event day
 * (for example 2026-12-06T00:00:00.000Z). Formatting them in the host zone
 * moves that day backward in the Americas and disagrees between Vercel (UTC)
 * and the browser, which is React hydration error #418.
 *
 * Date-only fields always use UTC. Session clocks name an explicit zone.
 */

export const RACE_CALENDAR_TIME_ZONE = "UTC"

export type RaceDateInput = string | Date | number | null | undefined

function toInstant(value: RaceDateInput): Date | null {
  if (value == null || value === "") return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function formatRaceCalendarDate(
  value: RaceDateInput,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = toInstant(value)
  if (!date) return ""
  return new Intl.DateTimeFormat("en-US", {
    ...(options ?? {
      month: "short",
      day: "numeric",
      year: "numeric"
    }),
    timeZone: RACE_CALENDAR_TIME_ZONE
  }).format(date)
}

export function formatRaceCalendarMonth(value: RaceDateInput): string {
  return formatRaceCalendarDate(value, { month: "long" })
}

/** `yyyy-MM-dd` in UTC, for date inputs that round-trip through `new Date("YYYY-MM-DD")`. */
export function formatRaceCalendarInput(value: RaceDateInput): string {
  const date = toInstant(value)
  if (!date) return ""
  return date.toISOString().slice(0, 10)
}

export function addRaceCalendarDays(
  value: RaceDateInput,
  days: number
): Date | null {
  const date = toInstant(value)
  if (!date) return null
  const next = new Date(date.getTime())
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

export function raceTimeZoneLabel(
  timeZoneId: string | null | undefined
): string {
  if (!timeZoneId) return "UTC"
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timeZoneId,
      timeZoneName: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    }).formatToParts(new Date("2026-06-15T12:00:00.000Z"))
    return parts.find(part => part.type === "timeZoneName")?.value || "UTC"
  } catch {
    return "UTC"
  }
}

/** Clock string such as "15:00", labeled with the circuit zone or UTC. */
export function formatSessionClock(
  clock: string,
  timeZoneId: string | null | undefined
): string {
  const trimmed = clock.trim()
  if (!trimmed) return ""
  return `${trimmed} ${raceTimeZoneLabel(timeZoneId)}`
}

/** Instant formatted in an explicit zone, including the short zone name. */
export function formatRaceSessionDateTime(
  value: RaceDateInput,
  timeZoneId: string | null | undefined
): string {
  const date = toInstant(value)
  if (!date) return ""
  let timeZone = "UTC"
  if (timeZoneId) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: timeZoneId }).format(date)
      timeZone = timeZoneId
    } catch {
      timeZone = "UTC"
    }
  }
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone,
    timeZoneName: "short"
  }).format(date)
}
