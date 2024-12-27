"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SelectCircuitLocation } from "@/db/schema"
import {
  findNearbyAirportsAction,
  syncAirportCoordinatesAction
} from "@/actions/db/airports-actions"
import { toast } from "sonner"
import { useUser } from "@clerk/nextjs"

interface FlightSearchProps {
  locations: SelectCircuitLocation[]
  circuitId: string
}

export default function FlightSearch({
  locations,
  circuitId
}: FlightSearchProps) {
  const { user } = useUser()
  const isAdmin = user?.publicMetadata.isAdmin === true

  async function handleSyncAirportCoordinates() {
    const result = await syncAirportCoordinatesAction()
    if (result.isSuccess) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  async function handleFindNearbyAirports() {
    const circuit = locations.find(loc => loc.type === "circuit")
    if (!circuit?.latitude || !circuit?.longitude) {
      toast.error("Circuit coordinates are required")
      return
    }

    const result = await findNearbyAirportsAction(
      Number(circuit.latitude),
      Number(circuit.longitude),
      100
    )
    if (result.isSuccess) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  const airports = locations.filter(loc => loc.type === "airport")

  return (
    <Card className="p-6">
      {isAdmin && (
        <div className="mb-4 flex gap-4">
          <Button onClick={handleSyncAirportCoordinates}>
            Sync Airport Coordinates
          </Button>
          <Button onClick={handleFindNearbyAirports}>
            Find Nearby Airports
          </Button>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Nearby Airports</h3>
        {airports.map(airport => (
          <div key={airport.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{airport.name}</p>
              <p className="text-sm text-gray-500">
                Code: {airport.airportCode}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {airport.transferTime ? `${airport.transferTime} minutes` : "N/A"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
