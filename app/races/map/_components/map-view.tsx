"use client"

import { WorldMap } from "@/components/races/WorldMap"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { useRouter } from "next/navigation"

interface MapViewProps {
  races: RaceWithCircuitAndSeries[]
}

export function MapView({ races }: MapViewProps) {
  const router = useRouter()

  return (
    <WorldMap
      races={races}
      onRaceSelect={race => router.push(`/races/${race.id}`)}
      className="h-[calc(100vh-16rem)]"
    />
  )
}
