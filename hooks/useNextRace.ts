import { useState, useEffect, useRef } from "react"
import { getRacesAction } from "@/actions/db/races-actions"
import {
  emptyCountdown,
  timeLeftUntil,
  type CountdownParts,
  type HeroCountdownSeed
} from "@/lib/countdown"
import { selectNextCountdownRace } from "@/lib/race-status"
import type { RaceStatusValue } from "@/services/providers/types"

export type { CountdownParts, HeroCountdownSeed } from "@/lib/countdown"

type CountdownRace = {
  name: string
  date: Date | string
  status: RaceStatusValue
  weekendEnd?: string | null
  weekend_end?: string | null
  timeZone?: string | null
  circuit: { name: string; timezone_id?: string | null } | null
}

/** When provided, the countdown is painted from server data and does not refetch. */
export type UseNextRaceInput = {
  seed: HeroCountdownSeed | null
}

function raceFromCandidate(candidate: {
  name: string
  date: string
  circuitName: string | null
  weekendEnd?: string | null
  timeZone?: string | null
}): CountdownRace {
  return {
    name: candidate.name,
    date: candidate.date,
    status: "upcoming",
    weekendEnd: candidate.weekendEnd ?? null,
    timeZone: candidate.timeZone ?? null,
    circuit: candidate.circuitName
      ? { name: candidate.circuitName, timezone_id: candidate.timeZone ?? null }
      : null
  }
}

function racesFromSeed(seed: HeroCountdownSeed): CountdownRace[] {
  if (seed.candidates && seed.candidates.length > 0) {
    return seed.candidates.map(raceFromCandidate)
  }
  return [raceFromCandidate(seed)]
}

function sameCountdownRace(
  current: CountdownRace | null,
  next: CountdownRace | null
): boolean {
  if (current === next) return true
  if (!current || !next) return false
  return (
    current.name === next.name &&
    new Date(current.date).getTime() === new Date(next.date).getTime()
  )
}

export function useNextRace(input?: UseNextRaceInput) {
  const seeded = input !== undefined
  const seed = input?.seed ?? null
  const [nextRace, setNextRace] = useState<CountdownRace | null>(() =>
    seed ? raceFromCandidate(seed) : null
  )
  const [timeLeft, setTimeLeft] = useState<CountdownParts>(() => {
    if (seed?.initialTime) return seed.initialTime
    if (seed) return timeLeftUntil(seed.date)
    return emptyCountdown()
  })
  const [countdownActive, setCountdownActive] = useState(() => {
    const parts = seed?.initialTime
    return Boolean(
      parts && (parts.days || parts.hours || parts.minutes || parts.seconds)
    )
  })
  const [isLoading, setIsLoading] = useState(!seeded)
  const [error, setError] = useState<string | null>(null)
  const racesRef = useRef<CountdownRace[]>(seed ? racesFromSeed(seed) : [])

  useEffect(() => {
    if (seeded) {
      racesRef.current = seed ? racesFromSeed(seed) : []
      return
    }

    const fetchRaces = async () => {
      try {
        const result = await getRacesAction()
        if (!result.isSuccess) {
          throw new Error(result.message)
        }

        racesRef.current = result.data
        // Event classification comes from derived status (getRacesAction).
        // race.date is the countdown target/order only.
        setNextRace(selectNextCountdownRace(result.data, new Date()) ?? null)
      } catch (err) {
        console.error("Error fetching next race:", err)
        setError(
          err instanceof Error ? err.message : "Failed to fetch next race"
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchRaces()
  }, [
    seeded,
    seed,
    seed?.circuitName,
    seed?.date,
    seed?.name,
    seed?.weekendEnd,
    seed?.timeZone,
    seed?.candidates
  ])

  useEffect(() => {
    if (!nextRace) return

    const tick = () => {
      const now = new Date()
      // race.date is the countdown target. The card stays until the weekend
      // end, then rolls to the next open race in the loaded list.
      const next = selectNextCountdownRace(racesRef.current, now) ?? null
      setNextRace(current =>
        sameCountdownRace(current, next) ? current : next
      )
      if (!next) {
        setCountdownActive(false)
        return
      }
      const live = new Date(next.date).getTime() > now.getTime()
      setCountdownActive(live)
      setTimeLeft(live ? timeLeftUntil(next.date, now) : emptyCountdown())
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [nextRace])

  return {
    ...timeLeft,
    raceName: nextRace?.name || "",
    countdownActive,
    isLoading,
    error,
    nextRace // Return the full race object in case we need more details
  }
}
