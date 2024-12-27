"use client"

import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { SelectCircuit } from "@/db/schema"
import { getCircuitsAction } from "@/actions/db/circuits-actions"
import { toast } from "sonner"

interface CircuitSelectProps {
  value: string
  onValueChange: (value: string) => void
}

export function CircuitSelect({ value, onValueChange }: CircuitSelectProps) {
  const [circuits, setCircuits] = useState<SelectCircuit[]>([])

  useEffect(() => {
    async function fetchCircuits() {
      const result = await getCircuitsAction()
      if (result.isSuccess) {
        setCircuits(result.data)
      } else {
        toast.error(result.message)
      }
    }
    fetchCircuits()
  }, [])

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select a circuit" />
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
