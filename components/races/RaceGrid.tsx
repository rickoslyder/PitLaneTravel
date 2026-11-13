"use client"

import { RaceWithCircuitAndSeries } from "@/types/database"
import { useRouter } from "next/navigation"
import { RaceCard } from "./RaceCard"
import type { PublicCoverageSummary } from "@/lib/public-coverage"

interface RaceGridProps {
  /** The races to display */
  races: RaceWithCircuitAndSeries[]
  /** The current view type */
  viewType: "grid" | "list"
  /** Callback when a race is clicked. Defaults to navigating to the race page. */
  onRaceClick?: (race: RaceWithCircuitAndSeries) => void
  /** Public coverage summaries keyed by race id */
  coverageByRaceId?: Record<string, PublicCoverageSummary>
}

export function RaceGrid({
  races,
  viewType,
  onRaceClick,
  coverageByRaceId
}: RaceGridProps) {
  const router = useRouter()
  const handleClick =
    onRaceClick ??
    ((race: RaceWithCircuitAndSeries) =>
      router.push(`/races/${race.slug || race.id}`))

  if (viewType === "grid") {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {races.map((race, index) => (
          <div key={race.id}>
            <RaceCard
              race={race}
              onClick={() => handleClick(race)}
              className="h-full"
              coverage={coverageByRaceId?.[race.id]}
              imagePriority={index === 0}
            />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {races.map(race => (
        <div key={race.id}>
          <RaceCard
            race={race}
            onClick={() => handleClick(race)}
            variant="list"
            coverage={coverageByRaceId?.[race.id]}
          />
        </div>
      ))}
    </div>
  )
}
