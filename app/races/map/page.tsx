"use server"

import { getRacesAction } from "@/actions/db/races-actions"
import { MapView } from "./_components/map-view"
import { Metadata } from "next"

export const metadata: Metadata = {
  title:
    "F1 Race Locations Map 2025 | Interactive Circuit Guide | PitLane Travel",
  description:
    "Explore Formula 1 circuits worldwide with our interactive map. Discover race locations, track details, and plan your F1 journey across the globe."
}

export default async function RacesMapPage() {
  const { data: races, isSuccess } = await getRacesAction()

  return (
    <div className="space-y-6">
      <div className="p-6">
        <h1 className="text-3xl font-bold tracking-tight">Race Locations</h1>
        <p className="text-muted-foreground">
          View all Formula 1 races on an interactive world map
        </p>
      </div>

      {isSuccess ? (
        <MapView races={races} />
      ) : (
        <div className="px-6">
          <p className="text-destructive">Failed to load races</p>
        </div>
      )}
    </div>
  )
}
