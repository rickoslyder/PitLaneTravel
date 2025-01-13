"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CircuitSelect } from "@/components/circuit-select"
import { SelectCircuit } from "@/db/schema"

interface CircuitSelectWrapperProps {
  circuits: SelectCircuit[]
  value?: string
  placeholder?: string
}

export function CircuitSelectWrapper({
  circuits,
  value,
  placeholder
}: CircuitSelectWrapperProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function onValueChange(newValue: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("circuitId", newValue)
    router.push(`?${params.toString()}`)
  }

  return (
    <CircuitSelect
      value={value || ""}
      onValueChange={onValueChange}
      circuits={circuits}
      placeholder={placeholder}
    />
  )
}
