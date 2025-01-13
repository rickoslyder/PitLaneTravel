"use client"

import { Button } from "@/components/ui/button"
import { RaceWithCircuitAndSeries } from "@/types/database"

interface CircuitSelectorProps {
  races: RaceWithCircuitAndSeries[]
  selectedRace: RaceWithCircuitAndSeries
  onSelectRace: (race: RaceWithCircuitAndSeries) => void
}

export function CircuitSelector({
  races,
  selectedRace,
  onSelectRace
}: CircuitSelectorProps) {
  return (
    <div>
      <h3 className="mb-4 text-2xl font-semibold">Choose a Circuit:</h3>
      <div className="space-y-4">
        {races.map(race => (
          <Button
            key={race.id}
            variant={selectedRace.id === race.id ? "default" : "outline"}
            className="w-full justify-start py-6 text-lg"
            onClick={() => onSelectRace(race)}
          >
            {race.circuit?.name}
          </Button>
        ))}
      </div>
    </div>
  )
}
