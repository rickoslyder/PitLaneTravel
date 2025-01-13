import { useState, useEffect } from 'react'
import { getRacesAction } from '@/actions/db/races-actions'
import { RaceWithCircuitAndSeries } from '@/types/database'

export function useNextRace() {
  const [nextRace, setNextRace] = useState<RaceWithCircuitAndSeries | null>(null)
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const result = await getRacesAction()
        if (!result.isSuccess) {
          throw new Error(result.message)
        }

        const now = new Date()
        const upcomingRaces = result.data.filter(race => new Date(race.date) > now)
        const nextUpcomingRace = upcomingRaces[0] // First race is the next one since they're ordered by date

        if (nextUpcomingRace) {
          setNextRace(nextUpcomingRace)
        }
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

      // If the race has passed, refetch races to get the next one
      if (difference < 0) {
        const fetchRaces = async () => {
          const result = await getRacesAction()
          if (result.isSuccess) {
            const now = new Date()
            const upcomingRaces = result.data.filter(race => new Date(race.date) > now)
            const nextUpcomingRace = upcomingRaces[0]
            if (nextUpcomingRace) {
              setNextRace(nextUpcomingRace)
            }
          }
        }
        fetchRaces()
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

