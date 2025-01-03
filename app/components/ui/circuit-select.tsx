"use client"

import { useState, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { SelectCircuit } from "@/db/schema"

interface CircuitSelectProps {
  value: SelectCircuit | null
  onChange: (circuit: SelectCircuit | null) => void
}

export function CircuitSelect({ value, onChange }: CircuitSelectProps) {
  const [circuits, setCircuits] = useState<SelectCircuit[]>([])

  useEffect(() => {
    fetch("/api/circuits")
      .then(res => res.json())
      .then(data => setCircuits(data.data))
      .catch(error => console.error("Error loading circuits:", error))
  }, [])

  return (
    <Select
      value={value?.id}
      onValueChange={id => {
        const circuit = circuits.find(c => c.id === id)
        onChange(circuit || null)
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Select a circuit">{value?.name}</SelectValue>
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
