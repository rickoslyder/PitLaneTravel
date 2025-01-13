"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { SelectCircuit } from "@/db/schema"

interface CircuitSelectProps {
  value: string
  onValueChange: (value: string) => void
  circuits: SelectCircuit[]
  placeholder?: string
}

export function CircuitSelect({
  value,
  onValueChange,
  circuits,
  placeholder = "Select a circuit"
}: CircuitSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {circuits.map(circuit => (
          <SelectItem key={circuit.id} value={circuit.id}>
            {circuit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
