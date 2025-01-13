"use server"

import { getRacesAction } from "@/actions/db/races-actions"
import { MapView } from "./_components/map-view"

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
