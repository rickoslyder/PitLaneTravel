/**
 * A stored instant at exactly 00:00:00.000Z is a date-only calendar day and
 * stays on that UTC day. Any other time is a real start instant and is
 * formatted in the circuit's IANA zone, or UTC when that zone is missing.
 * The zone is always passed to Intl, so server and browser output match.
 */

export type RaceDateInput = string | Date | number | null | undefined

function toInstant(value: RaceDateInput): Date | null {
  if (value == null || value === "") return null
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

/** True when the instant is UTC midnight, including zero milliseconds. */
export function isUtcDateOnlyInstant(date: Date): boolean {
  return (
    date.getUTCHours() === 0 &&
    date.getUTCMinutes() === 0 &&
    date.getUTCSeconds() === 0 &&
    date.getUTCMilliseconds() === 0
  )
}

export function raceCalendarZone(
  date: Date,
  timeZoneId?: string | null
): string {
  if (isUtcDateOnlyInstant(date)) return "UTC"
  if (!timeZoneId) return "UTC"
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timeZoneId }).format(date)
    return timeZoneId
  } catch {
    return "UTC"
  }
}

export function formatRaceCalendarDate(
  value: RaceDateInput,
  options?: Intl.DateTimeFormatOptions,
  timeZoneId?: string | null
): string {
  const date = toInstant(value)
  if (!date) return ""
  const formatOptions =
    options ??
    ({
      month: "short",
      day: "numeric",
      year: "numeric"
    } satisfies Intl.DateTimeFormatOptions)
  return new Intl.DateTimeFormat("en-US", {
    ...formatOptions,
    timeZone: raceCalendarZone(date, timeZoneId)
  }).format(date)
}

export function formatRaceCalendarMonth(
  value: RaceDateInput,
  timeZoneId?: string | null
): string {
  return formatRaceCalendarDate(value, { month: "long" }, timeZoneId)
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

function shortZoneName(timeZone: string, instant: Date, locale: string): string | undefined {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    timeZoneName: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(instant)
  return parts.find(part => part.type === "timeZoneName")?.value
}

/**
 * en-US says PST but GMT+1 for Paris. en-GB says CET but GMT-8 for Las Vegas.
 * Prefer a letter abbreviation from either locale, and keep plain GMT.
 */
function zoneAbbreviation(timeZone: string, instant: Date): string {
  let us: string | undefined
  let gb: string | undefined
  try {
    us = shortZoneName(timeZone, instant, "en-US")
    gb = shortZoneName(timeZone, instant, "en-GB")
  } catch {
    return "UTC"
  }
  const named = [us, gb].find(
    value => value && value !== "GMT" && !/^GMT[+-]/.test(value)
  )
  return named || us || gb || "UTC"
}

export function raceTimeZoneLabel(
  timeZoneId: string | null | undefined,
  at?: RaceDateInput
): string {
  if (!timeZoneId) return "UTC"
  const instant = toInstant(at)
  if (!instant) return "UTC"
  if (timeZoneId === "UTC") return "UTC"
  return zoneAbbreviation(timeZoneId, instant)
}

/** Clock string such as "15:00", labeled from the session's own instant. */
export function formatSessionClock(
  clock: string,
  timeZoneId: string | null | undefined,
  at?: RaceDateInput
): string {
  const trimmed = clock.trim()
  if (!trimmed) return ""
  return `${trimmed} ${raceTimeZoneLabel(timeZoneId, at)}`
}

/** Instant formatted in an explicit zone, including the short zone name. */
export function formatRaceSessionDateTime(
  value: RaceDateInput,
  timeZoneId: string | null | undefined
): string {
  const date = toInstant(value)
  if (!date) return ""
  const timeZone = raceCalendarZone(date, timeZoneId)
  const clock = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone
  }).format(date)
  return `${clock} ${raceTimeZoneLabel(timeZone, date)}`
}
