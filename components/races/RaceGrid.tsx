"use client"

import { RaceWithCircuitAndSeries } from "@/types/database"
import { useRouter } from "next/navigation"
import { RaceCard } from "./RaceCard"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"

interface RaceGridProps {
  /** The races to display */
  races: RaceWithCircuitAndSeries[]
  /** The current view type */
  viewType: "grid" | "list"
  /** Callback when a race is clicked. Defaults to navigating to the race page. */
  onRaceClick?: (race: RaceWithCircuitAndSeries) => void
  /** Public coverage summaries keyed by race id */
  coverageByRaceId?: Record<string, PublicCoverageSummary>
  /**
   * Race ids that have ticket rows. When omitted, cards keep View Details.
   * When present, a missing id is an empty listing.
   */
  ticketedRaceIds?: readonly string[]
}

export function RaceGrid({
  races,
  viewType,
  onRaceClick,
  coverageByRaceId,
  ticketedRaceIds
}: RaceGridProps) {
  const router = useRouter()
  const ticketed = ticketedRaceIds ? new Set(ticketedRaceIds) : null
  const handleClick =
    onRaceClick ??
    ((race: RaceWithCircuitAndSeries) =>
      router.push(`/races/${race.slug || race.id}`))

  const listingStateFor = (raceId: string): TicketListingState | undefined => {
    if (!ticketed) return undefined
    return ticketed.has(raceId) ? "listed" : "empty"
  }

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
              listingState={listingStateFor(race.id)}
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
            listingState={listingStateFor(race.id)}
          />
        </div>
      ))}
    </div>
  )
}
