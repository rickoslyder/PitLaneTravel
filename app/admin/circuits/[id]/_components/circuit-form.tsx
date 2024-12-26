"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectCircuit } from "@/db/schema"
import { useState } from "react"
import { toast } from "sonner"
import { updateCircuitAction } from "@/actions/db/circuits-actions"

interface CircuitFormProps {
  circuit: SelectCircuit
}

export default function CircuitForm({ circuit }: CircuitFormProps) {
  const [latitude, setLatitude] = useState(circuit.latitude || "")
  const [longitude, setLongitude] = useState(circuit.longitude || "")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const result = await updateCircuitAction(circuit.id, {
      latitude,
      longitude
    })

    if (result.isSuccess) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitude</Label>
          <Input
            id="latitude"
            value={latitude}
            onChange={e => setLatitude(e.target.value)}
            placeholder="Enter latitude"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitude</Label>
          <Input
            id="longitude"
            value={longitude}
            onChange={e => setLongitude(e.target.value)}
            placeholder="Enter longitude"
          />
        </div>

        <Button type="submit">Update Circuit</Button>
      </form>
    </Card>
  )
}
