"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { FlightSearchContainer } from "./_components/flight-search-container"
import { getRacesAction } from "@/actions/db/races-actions"
import { isActiveRaceStatus } from "@/lib/race-status"

export default async function FlightsPage() {
  const { userId } = await auth()
  // if (!userId) redirect("/login")

  const { data: races, isSuccess } = await getRacesAction({
    excludeCancelled: true
  })
  if (!isSuccess || !races) {
    throw new Error("Failed to fetch races")
  }

  const upcomingRaces = races.filter(race => isActiveRaceStatus(race.status))

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Flight Search</h1>
        <p className="text-muted-foreground">
          Search flight options for a race weekend. PitLane does not book, sell,
          or issue flights. Results are a planning affordance with an external
          provider handoff.
        </p>
      </div>

      <FlightSearchContainer races={upcomingRaces} userId={userId} />
    </div>
  )
}
