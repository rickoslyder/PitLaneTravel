"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { syncAirportCoordinatesAction } from "@/actions/db/airports-actions"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Plane as PlaneIcon, RefreshCw } from "lucide-react"
import Link from "next/link"

interface Airport {
  id: string
  name: string
  airportCode: string | null
  latitude: string
  longitude: string
  circuitId: string
  circuitName: string | null
}

interface AirportsTableProps {
  airports: Airport[]
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
          <RefreshCw className="mr-2 size-4" />
          Sync All Airport Coordinates
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Airport Code</TableHead>
            <TableHead>Circuit</TableHead>
            <TableHead>Coordinates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {airports.map(airport => (
            <TableRow key={airport.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <PlaneIcon className="size-4 text-blue-500" />
                  <span className="font-medium">{airport.name}</span>
                </div>
              </TableCell>
              <TableCell>
                <code className="rounded bg-gray-100 px-2 py-1">
                  {airport.airportCode}
                </code>
              </TableCell>
              <TableCell>
                {airport.circuitName ? (
                  <Link
                    href={`/admin/circuits/${airport.circuitId}`}
                    className="text-blue-500 hover:underline"
                  >
                    {airport.circuitName}
                  </Link>
                ) : (
                  airport.circuitId
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-500">
                  {airport.latitude}, {airport.longitude}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
