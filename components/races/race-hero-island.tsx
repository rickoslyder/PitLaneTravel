"use client"

import { RaceHero } from "@/components/races/hero/RaceHero"
import { publishRaceTab } from "@/lib/race-tab-event"
import type { TicketListingState } from "@/components/races/tickets/ticket-availability"
import type { RaceWithDetails } from "@/types/race"

/**
 * The hero is outside the details suspense boundary so its photo is in the
 * first HTML chunk. Tab buttons publish an event the panel listens for.
 */
export function RaceHeroIsland({
  race,
  ticketListings
}: {
  race: RaceWithDetails
  ticketListings: TicketListingState
}) {
  return (
    <RaceHero
      race={race}
      onTabChange={publishRaceTab}
      ticketListings={ticketListings}
    />
  )
}
