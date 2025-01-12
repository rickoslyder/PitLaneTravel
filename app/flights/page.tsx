"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { FlightSearchContainer } from "./_components/flight-search-container"
import { getRacesAction } from "@/actions/db/races-actions"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "F1 Race Weekend Flights | Best Flight Deals | PitLane Travel",
  description:
    "Find and book the best flights to Formula 1 races worldwide. Compare prices, schedules, and airlines to get to your next Grand Prix with ease."
}

export default async function FlightsPage() {
  const { userId } = await auth()
  // if (!userId) redirect("/login")

  const { data: races, isSuccess } = await getRacesAction()
  if (!isSuccess || !races) {
    throw new Error("Failed to fetch races")
  }

  const upcomingRaces = races.filter(race => new Date(race.date) > new Date())

  return (
    <div className="container space-y-8 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Flight Search</h1>
        <p className="text-muted-foreground">
          Search and book flights for your F1 race weekend
        </p>
      </div>

      <FlightSearchContainer races={upcomingRaces} userId={userId} />
    </div>
  )
}
