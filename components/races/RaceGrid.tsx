"use client"

import type { SeriesCalendarRace } from "@/lib/series-card-image"
import { useRouter } from "next/navigation"
import { firstRaceIdWithImage } from "@/lib/race-series-image"
import { RaceCard } from "./RaceCard"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"

interface RaceGridProps<T extends SeriesCalendarRace> {
  /** The races to display */
  races: T[]
  /** The current view type */
  viewType: "grid" | "list"
  /** Callback when a race is clicked. Defaults to navigating to the race page. */
  onRaceClick?: (race: T) => void
  /** Public coverage summaries keyed by race id */
  coverageByRaceId?: Record<string, PublicCoverageSummary>
  /**
   * Race ids that have ticket rows. When omitted, cards keep View Details.
   * When present, a missing id is an empty listing.
   */
  ticketedRaceIds?: readonly string[]
  /** Series pages pass the real card frame so mobile does not assume 100vw. */
  imageSizes?: string
}

export function RaceGrid<T extends SeriesCalendarRace>({
  races,
  viewType,
  onRaceClick,
  coverageByRaceId,
  ticketedRaceIds,
  imageSizes
}: RaceGridProps<T>) {
  const router = useRouter()
  const ticketed = ticketedRaceIds ? new Set(ticketedRaceIds) : null
  const handleClick =
    onRaceClick ?? ((race: T) => router.push(`/races/${race.slug || race.id}`))

  const listingStateFor = (raceId: string): TicketListingState | undefined => {
    if (!ticketed) return undefined
    return ticketed.has(raceId) ? "listed" : "empty"
  }

  if (viewType === "grid") {
    const priorityRaceId = firstRaceIdWithImage(races)
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {races.map(race => (
          <div key={race.id}>
            <RaceCard
              race={race}
              onClick={() => handleClick(race)}
              className="h-full"
              coverage={coverageByRaceId?.[race.id]}
              imagePriority={race.id === priorityRaceId}
              imageSizes={imageSizes}
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
