import {
  isOpenCountdownRace,
  selectNextCountdownRace,
  type CountdownRaceFields
} from "@/lib/race-status"
import type { RaceStatusValue } from "@/services/providers/types"

export type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export type HeroCountdownCandidate = {
  name: string
  date: string
  circuitName: string | null
  weekendEnd: string | null
  timeZone: string | null
}

export type HeroCountdownSeed = {
  name: string
  date: string
  circuitName: string | null
  weekendEnd?: string | null
  timeZone?: string | null
  /** Digits computed once on the server so the first client render matches. */
  initialTime?: CountdownParts
  /** Later open races so a loaded page can roll forward without a refetch. */
  candidates?: HeroCountdownCandidate[]
}

const COUNTDOWN_CANDIDATE_LIMIT = 8

export type CountdownSeedRace = CountdownRaceFields & {
  name: string
  status: RaceStatusValue
  circuit?: { name?: string | null; timezone_id?: string | null } | null
  circuitName?: string | null
}

function isoInstant(value: Date | string | null | undefined): string | null {
  if (value == null || value === "") return null
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return null
  return new Date(time).toISOString()
}

function seedFields(race: CountdownSeedRace): HeroCountdownCandidate {
  return {
    name: race.name,
    date: isoInstant(race.date) ?? "",
    circuitName: race.circuit?.name ?? race.circuitName ?? null,
    weekendEnd: isoInstant(race.weekendEnd ?? race.weekend_end),
    timeZone:
      race.timeZone ?? race.timezone_id ?? race.circuit?.timezone_id ?? null
  }
}

/** The next open race, plus the following open races, for the home countdown. */
export function buildHeroCountdownSeed(
  races: readonly CountdownSeedRace[],
  now: Date
): HeroCountdownSeed | null {
  const next = selectNextCountdownRace(races, now)
  if (!next) return null
  const candidates = races
    .filter(race => isOpenCountdownRace(race, now))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, COUNTDOWN_CANDIDATE_LIMIT)
    .map(seedFields)
    .filter(candidate => candidate.date !== "")
  const selected = seedFields(next)
  return {
    ...selected,
    initialTime: timeLeftUntil(selected.date, now),
    candidates: candidates.length > 0 ? candidates : [selected]
  }
}

export function emptyCountdown(): CountdownParts {
  return { days: 0, hours: 0, minutes: 0, seconds: 0 }
}

export function timeLeftUntil(
  date: Date | string,
  now = new Date()
): CountdownParts {
  const target = new Date(date).getTime()
  const difference = target - now.getTime()
  if (!Number.isFinite(target) || difference < 0) return emptyCountdown()
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  }
}
