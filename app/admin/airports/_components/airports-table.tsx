"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SelectCircuitLocation } from "@/db/schema"
import { syncAirportCoordinatesAction } from "@/actions/db/airports-actions"
import { toast } from "sonner"

interface AirportsTableProps {
  airports: SelectCircuitLocation[]
}

export default function AirportsTable({ airports }: AirportsTableProps) {
  async function handleSyncAirportCoordinates() {
    const result = await syncAirportCoordinatesAction()
    if (result.isSuccess) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Airports</h2>
        <Button onClick={handleSyncAirportCoordinates}>
          Sync All Airport Coordinates
        </Button>
      </div>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Airport Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Circuit
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Coordinates
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {airports.map(airport => (
            <tr key={airport.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                {airport.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {airport.airportCode}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {airport.circuitId}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {airport.latitude}, {airport.longitude}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}
