import { RaceCalendarControls } from "@/components/races/race-calendar-controls"
import { toListingCardModel } from "@/components/races/race-listing-card"
import {
  ListingCardView,
  raceListingListStyles
} from "@/components/races/race-listing-card-view"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"
import { raceHasFinished } from "@/lib/finished-race"
import type { PublicCoverageSummary } from "@/lib/public-coverage"
import { racesForTiming, type RaceTiming } from "@/lib/race-calendar-window"
import { seriesTabs } from "@/lib/race-listing-filter"
import type { RaceWithCircuitAndSeries } from "@/types/database"
import Link from "next/link"

interface RacesPageProps {
  initialRaces: RaceWithCircuitAndSeries[]
  coverageByRaceId?: Record<string, PublicCoverageSummary>
  /** UTC start of the current day. Upcoming is date >= this instant. */
  asOfIso: string
  /** Race ids with ticket rows. Omitted keeps the details button on each card. */
  ticketedRaceIds?: readonly string[]
}

export function RacesPage({
  initialRaces,
  coverageByRaceId,
  asOfIso,
  ticketedRaceIds
}: RacesPageProps) {
  const now = new Date()
  const ticketed = ticketedRaceIds ? new Set(ticketedRaceIds) : null
  const upcoming = racesForTiming(initialRaces, "upcoming", asOfIso)
  const past = racesForTiming(initialRaces, "past", asOfIso)
  const tabs = seriesTabs(initialRaces)

  const listingStateFor = (
    race: RaceWithCircuitAndSeries
  ): TicketListingState | undefined => {
    if (!ticketed) return undefined
    if (race.status === "cancelled" || raceHasFinished(race, now)) {
      return undefined
    }
    return ticketed.has(race.id) ? "listed" : "empty"
  }

  const modelFor = (race: RaceWithCircuitAndSeries, timing: RaceTiming) =>
    toListingCardModel(
      race,
      timing,
      coverageByRaceId?.[race.id],
      listingStateFor(race)
    )

  return (
    <>
      <style>{raceListingListStyles}</style>
      <div className="space-y-8" data-races-listing-body="">
        <div className="bg-card mx-auto max-w-7xl rounded-lg p-6 shadow">
          <h2 className="mb-6 text-center text-2xl font-bold">Race Calendar</h2>
          <RaceCalendarControls
            series={tabs}
            upcomingCount={upcoming.length}
            pastCount={past.length}
            pastCards={past.map(race => modelFor(race, "past"))}
          >
            {upcoming.map(race => (
              <ListingCardView
                key={race.id}
                model={modelFor(race, "upcoming")}
              />
            ))}
          </RaceCalendarControls>
          <p className="text-muted-foreground mt-6 text-center text-sm">
            <Link
              href="/image-credits"
              className="underline underline-offset-2"
            >
              Photograph credits
            </Link>
          </p>
        </div>
      </div>
    </>
  )
}
