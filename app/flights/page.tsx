"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { FlightSearchContainer } from "./_components/flight-search-container"
import { getRacesAction } from "@/actions/db/races-actions"
import { isActiveRaceStatus } from "@/lib/race-status"

export const metadata: Metadata = {
  title: "Flight search | PitLane Travel"
}

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
          {
            "Search flights for a race weekend. These prices are here to help you plan. PitLane doesn't sell flights, so you book with the airline or a travel site."
          }
        </p>
      </div>

      <FlightSearchContainer races={upcomingRaces} userId={userId} />
    </div>
  )
}
