"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SelectCircuitLocation } from "@/db/schema"
import {
  findNearbyAirportsAction,
  syncAirportCoordinatesAction
} from "@/actions/db/airports-actions"
import { toast } from "sonner"

interface LocationsTableProps {
  locations: SelectCircuitLocation[]
  circuitId: string
}

export default function LocationsTable({
  locations,
  circuitId
}: LocationsTableProps) {
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
      circuitId,
      Number(circuit.latitude),
      Number(circuit.longitude)
    )
    if (result.isSuccess) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex gap-4">
        <Button onClick={handleSyncAirportCoordinates}>
          Sync Airport Coordinates
        </Button>
        <Button onClick={handleFindNearbyAirports}>Find Nearby Airports</Button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Airport Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Coordinates
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {locations.map(location => (
            <tr key={location.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {location.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {location.type}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {location.airportCode}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {location.latitude}, {location.longitude}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
