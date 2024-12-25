"use server"

import { RacesPage } from "@/components/races/RacesPage"
import { getRacesAction } from "@/actions/db/races-actions"
import { RaceWithCircuit } from "@/types/database"
import { Suspense } from "react"

async function RacesFetcher() {
  console.log("[Races Page] Fetching races...")
  const { data: dbRaces, isSuccess, message } = await getRacesAction()

  if (!isSuccess) {
    console.error("[Races Page] Failed to fetch races:", message)
    return (
      <div className="py-8 text-center">Error loading races: {message}</div>
    )
  }

  if (!dbRaces || dbRaces.length === 0) {
    console.log("[Races Page] No races found")
    return <div className="py-8 text-center">No races available</div>
  }

  console.log("[Races Page] Found", dbRaces.length, "races")

  const races: RaceWithCircuit[] = dbRaces.map(race => ({
    ...race,
    circuit_id: race.circuit_id,
    status: "upcoming",
    is_sprint_weekend: false,
    slug: race.name.toLowerCase().replace(/\s+/g, "-"),
    date: race.date,
    created_at: race.created_at,
    updated_at: race.updated_at,
    circuit: race.circuit
  }))

  console.log("[Races Page] Transformed races data")
  return <RacesPage initialRaces={races} />
}

export default async function RacesRoute() {
  return (
    <Suspense
      fallback={<div className="py-8 text-center">Loading races...</div>}
    >
      <RacesFetcher />
    </Suspense>
  )
}
