import { useState, useEffect } from "react"
import { getRacesAction } from "@/actions/db/races-actions"
import { RaceWithCircuitAndSeries } from "@/types/database"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface UseNextRaceReturn {
  raceName: string
  isLoading: boolean
  error: string | null
  nextRace: RaceWithCircuitAndSeries | null
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function useNextRace(): UseNextRaceReturn {
  const [nextRace, setNextRace] = useState<RaceWithCircuitAndSeries | null>(
    null
  )
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        console.group("🏁 FETCHING RACES")
        const result = await getRacesAction()
        if (!result.isSuccess) {
          throw new Error(result.message)
        }

        const now = new Date()
        const upcomingRaces = result.data.filter(
          race => new Date(race.date) > now
        )
        const nextUpcomingRace = upcomingRaces[0] // First race is the next one since they're ordered by date

        if (nextUpcomingRace) {
          console.log(
            "📅 Next race date from DB:",
            nextUpcomingRace.date,
            typeof nextUpcomingRace.date
          )
          const parsedDate = new Date(nextUpcomingRace.date)
          console.log(
            "⏰ Parsed race date:",
            parsedDate.toISOString(),
            parsedDate.getTime()
          )
          setNextRace(nextUpcomingRace)
        }
        console.groupEnd()
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
  }, []) // Only fetch once on mount

  useEffect(() => {
    if (!nextRace) return

    const calculateTimeLeft = () => {
      const now = new Date()
      // Ensure we parse the timezone-aware timestamp correctly
      const raceDate = nextRace.date
      const race = typeof raceDate === "string" ? new Date(raceDate) : raceDate

      if (now >= race) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 }
      }

      const difference = race.getTime() - now.getTime()
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    console.log("🚀 Setting up timer for race:", nextRace.name)
    // Initial calculation
    const initial = calculateTimeLeft()
    console.log("📊 Initial time left:", initial)
    setTimeLeft(initial)

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft()
      console.log("🔄 Timer update:", newTimeLeft)

      // If all values are 0, the race has passed
      if (Object.values(newTimeLeft).every(v => v === 0)) {
        console.log("🏁 Race has passed, refetching...")
        // Race has passed, refetch races
        const fetchRaces = async () => {
          const result = await getRacesAction()
          if (result.isSuccess) {
            const now = new Date()
            const upcomingRaces = result.data.filter(
              race => new Date(race.date) > now
            )
            const nextUpcomingRace = upcomingRaces[0]
            if (nextUpcomingRace) {
              setNextRace(nextUpcomingRace)
            }
          }
        }
        fetchRaces()
      } else {
        setTimeLeft(newTimeLeft)
      }
    }, 1000)

    return () => {
      console.log("🛑 Cleaning up timer for race:", nextRace.name)
      clearInterval(timer)
    }
  }, [nextRace])

  return {
    days: timeLeft.days,
    hours: timeLeft.hours,
    minutes: timeLeft.minutes,
    seconds: timeLeft.seconds,
    raceName: nextRace?.name || "",
    isLoading,
    error,
    nextRace
  }
}
