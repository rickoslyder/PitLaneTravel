"use server"

import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getUserTripsAction } from "@/actions/db/trips-actions"
import { TripCard } from "./_components/trip-card"
import { EmptyTrips } from "./_components/empty-trips"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "My F1 Trips | Race Weekend Planning | PitLane Travel",
  description:
    "Manage your Formula 1 race weekend trips in one place. Track bookings, create itineraries, and organize your F1 adventures with our comprehensive trip planner."
}

export default async function TripsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/login")
  }

  const result = await getUserTripsAction(userId)

  if (!result.isSuccess) {
    return <EmptyTrips error={result.message} />
  }

  const trips = result.data

  if (trips.length === 0) {
    return <EmptyTrips />
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Trips</h1>
          <p className="text-muted-foreground">
            Manage and plan your F1 race weekends
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {trips.map(trip => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  )
}
