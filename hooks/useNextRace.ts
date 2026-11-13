import { useState, useEffect, useRef } from "react"
import { getRacesAction } from "@/actions/db/races-actions"
import { selectNextCountdownRace } from "@/lib/race-status"
import type { RaceStatusValue } from "@/services/providers/types"

type CountdownRace = {
  name: string
  date: Date | string
  status: RaceStatusValue
  circuit: { name: string } | null
}

export type CountdownParts = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export type HeroCountdownSeed = {
  name: string
  date: string
  circuitName: string | null
  /** Digits computed once on the server so the first client render matches. */
  initialTime?: CountdownParts
}

/** When provided, the countdown is painted from server data and does not refetch. */
export type UseNextRaceInput = {
  seed: HeroCountdownSeed | null
}

function emptyTime() {
  return { days: 0, hours: 0, minutes: 0, seconds: 0 }
}

export function timeLeftUntil(date: Date | string, now = new Date()) {
  const target = new Date(date).getTime()
  const difference = target - now.getTime()
  if (!Number.isFinite(target) || difference < 0) return emptyTime()
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60)
  }
}

function raceFromSeed(seed: HeroCountdownSeed): CountdownRace {
  return {
    name: seed.name,
    date: new Date(seed.date),
    status: "upcoming",
    circuit: seed.circuitName ? { name: seed.circuitName } : null
  }
}

export function useNextRace(input?: UseNextRaceInput) {
  const seeded = input !== undefined
  const seed = input?.seed ?? null
  const [nextRace, setNextRace] = useState<CountdownRace | null>(() =>
    seed ? raceFromSeed(seed) : null
  )
  const [timeLeft, setTimeLeft] = useState<CountdownParts>(() => {
    if (seed?.initialTime) return seed.initialTime
    if (seed) return timeLeftUntil(seed.date)
    return emptyTime()
  })
  const [isLoading, setIsLoading] = useState(!seeded)
  const [error, setError] = useState<string | null>(null)
  const racesRef = useRef<CountdownRace[]>(seed ? [raceFromSeed(seed)] : [])

  useEffect(() => {
    if (seeded) {
      racesRef.current = seed ? [raceFromSeed(seed)] : []
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
  }, [seeded, seed?.circuitName, seed?.date, seed?.name])

  useEffect(() => {
    if (!nextRace) return

    const tick = () => {
      const now = new Date()
      const raceDate = new Date(nextRace.date)
      const difference = raceDate.getTime() - now.getTime()

      // Date passed: pick the next future countdown target from the already-loaded
      // list. Do not refetch every second — an in-progress weekend whose race.date
      // has passed would otherwise loop and hide the next future race.
      if (difference < 0) {
        setNextRace(selectNextCountdownRace(racesRef.current, now) ?? null)
        return
      }

      setTimeLeft(timeLeftUntil(raceDate, now))
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [nextRace])

  return {
    ...timeLeft,
    raceName: nextRace?.name || "",
    isLoading,
    error,
    nextRace // Return the full race object in case we need more details
  }
}
