"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getRaceByIdAction } from "@/actions/db/races-actions"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { CircuitCard } from "./_components/circuit-card"
import { CircuitSelector } from "./_components/circuit-selector"
import { CircuitExplorerHeader } from "./_components/circuit-explorer-header"
import { CircuitExplorerSkeleton } from "./_components/circuit-explorer-skeleton"

const FEATURED_RACE_IDS = [
  "bff9eaa9-fa00-4f9f-89cf-abfe3adcf84a", // Monaco
  "9c6541de-c780-430f-8735-14b8bc6e6047", // Silverstone
  "784323b9-fd6a-4635-a148-ebb5b45246d8" // Monza
]

export default function CircuitExplorer() {
  const [races, setRaces] = useState<RaceWithCircuitAndSeries[]>([])
  const [selectedRace, setSelectedRace] =
    useState<RaceWithCircuitAndSeries | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRaces() {
      setIsLoading(true)
      try {
        const racePromises = FEATURED_RACE_IDS.map(id => getRaceByIdAction(id))
        const results = await Promise.all(racePromises)
        const successfulResults = results
          .filter(result => result.isSuccess && result.data)
          .map(result => result.data!)
        setRaces(successfulResults)
        if (successfulResults.length > 0) {
          setSelectedRace(successfulResults[0])
        }
      } catch (error) {
        console.error("Error fetching races:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRaces()
  }, [])

  if (isLoading || !selectedRace) {
    return <CircuitExplorerSkeleton />
  }

  return (
    <section
      className="mt-20 bg-gradient-to-b from-gray-50 to-white py-20 dark:from-gray-800 dark:to-gray-900"
      aria-labelledby="circuit-explorer-title"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <CircuitExplorerHeader />

          <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">
            {/* Circuit selector appears first on mobile */}
            <div className="md:hidden">
              <CircuitSelector
                races={races}
                selectedRace={selectedRace}
                onSelectRace={setSelectedRace}
              />
            </div>

            <motion.div
              key={selectedRace.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <CircuitCard race={selectedRace} />
            </motion.div>

            {/* Circuit selector appears on the right on larger screens */}
            <div className="hidden md:block">
              <CircuitSelector
                races={races}
                selectedRace={selectedRace}
                onSelectRace={setSelectedRace}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
