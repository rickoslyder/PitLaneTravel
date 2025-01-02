"use client"

import { RaceWithCircuitAndSeries } from "@/types/database"
import { motion } from "framer-motion"
import { RaceCard } from "./RaceCard"

interface RaceGridProps {
  /** The races to display */
  races: RaceWithCircuitAndSeries[]
  /** The current view type */
  viewType: "grid" | "list"
  /** Callback when a race is clicked */
  onRaceClick: (race: RaceWithCircuitAndSeries) => void
}

export function RaceGrid({ races, viewType, onRaceClick }: RaceGridProps) {
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

  if (viewType === "grid") {
    return (
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {races.map(race => (
          <motion.div key={race.id} variants={item}>
            <RaceCard
              race={race}
              onClick={() => onRaceClick(race)}
              className="h-full"
            />
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return (
    <motion.div
      className="space-y-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {races.map(race => (
        <motion.div key={race.id} variants={item}>
          <RaceCard
            race={race}
            onClick={() => onRaceClick(race)}
            variant="list"
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
