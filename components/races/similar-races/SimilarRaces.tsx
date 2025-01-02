"use client"

import { useEffect, useState } from "react"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { RaceCard } from "../RaceCard"
import { motion } from "framer-motion"

interface SimilarRacesProps {
  /** The current race to find similar races for */
  currentRace: RaceWithCircuitAndSeries
}

export function SimilarRaces({ currentRace }: SimilarRacesProps) {
  const [similarRaces, setSimilarRaces] = useState<RaceWithCircuitAndSeries[]>(
    []
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSimilarRaces = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch(`/api/races/${currentRace.id}/similar`)
        if (!response.ok) {
          throw new Error("Failed to fetch similar races")
        }
        const data = await response.json()
        setSimilarRaces(data.data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSimilarRaces()
  }, [currentRace.id])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Similar Races</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-muted h-[300px] animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Similar Races</h2>
        <div className="text-muted-foreground rounded-lg border p-4 text-center">
          Failed to load similar races
        </div>
      </div>
    )
  }

  if (similarRaces.length === 0) {
    return null
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Similar Races</h2>
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {similarRaces.map(race => (
          <motion.div key={race.id} variants={item}>
            <RaceCard race={race} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
