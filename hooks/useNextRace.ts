import { useState, useEffect, useRef } from 'react'
import { getRacesAction } from '@/actions/db/races-actions'
import { RaceWithCircuitAndSeries } from '@/types/database'
import { selectNextCountdownRace } from '@/lib/race-status'

export function useNextRace() {
  const [nextRace, setNextRace] = useState<RaceWithCircuitAndSeries | null>(null)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const racesRef = useRef<RaceWithCircuitAndSeries[]>([])

  useEffect(() => {
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
        console.error('Error fetching next race:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch next race')
      } finally {
        setIsLoading(false)
      }
    }

    fetchRaces()
  }, []) // Only fetch once on mount

  useEffect(() => {
    if (!nextRace) return

    const timer = setInterval(() => {
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

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24)
      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)
      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [nextRace])

  return {
    ...timeLeft,
    raceName: nextRace?.name || '',
    isLoading,
    error,
    nextRace // Return the full race object in case we need more details
  }
}
