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
  const startMs = race.weekendStart != null ? epochMs(race.weekendStart) : dateMs
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

export function selectNextCountdownRace<
  T extends { status: RaceStatusValue; date: Date | string }
>(races: readonly T[], now: Date): T | undefined {
  return races.find(
    race =>
      isActiveRaceStatus(race.status) &&
      new Date(race.date).getTime() > now.getTime()
  )
}
