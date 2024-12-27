"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { getRacesAction } from "@/actions/db/races-actions"
import { RaceWithCircuit } from "@/types/database"
import { FormControl } from "@/components/ui/form"

interface RaceSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function RaceSelect({ value, onValueChange }: RaceSelectProps) {
  const [races, setRaces] = useState<RaceWithCircuit[]>([])

  useEffect(() => {
    async function fetchRaces() {
      const result = await getRacesAction()
      if (result.isSuccess) {
        setRaces(result.data)
      }
    }

    fetchRaces()
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select race" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {races.map(race => (
          <SelectItem key={race.id} value={race.id}>
            {race.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
