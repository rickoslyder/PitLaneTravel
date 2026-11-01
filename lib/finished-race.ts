const DAY_MS = 24 * 60 * 60 * 1000

export type FinishedRaceInput = {
  status?: string | null
  date: Date | string
  weekend_end?: Date | string | null
  weekendEnd?: Date | string | null
}

function instant(value: Date | string | null | undefined): number | null {
  if (value == null) return null
  const date = value instanceof Date ? value : new Date(value)
  const time = date.getTime()
  return Number.isNaN(time) ? null : time
}

/**
 * A race has finished when its stored status is completed, or its end is
 * already in the past. Cancelled races keep their own treatment. When the
 * weekend end is missing, the end is the race date plus 24 hours, matching
 * deriveRaceStatus.
 */
export function raceHasFinished(race: FinishedRaceInput, now: Date): boolean {
  if (race.status === "cancelled") return false
  if (race.status === "completed") return true

  const nowMs = now.getTime()
  const endMs = instant(race.weekend_end ?? race.weekendEnd)
  if (endMs != null) return endMs <= nowMs

  const startMs = instant(race.date)
  if (startMs == null) return false
  return startMs + DAY_MS <= nowMs
}
