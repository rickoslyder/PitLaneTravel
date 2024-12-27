"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectCircuit, SelectCircuitLocation } from "@/db/schema"
import { syncAirportCoordinatesAction } from "@/actions/db/airports-actions"
import { deleteCircuitLocationAction } from "@/actions/db/circuit-locations-actions"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  Circle as CircuitIcon,
  Plane as PlaneIcon,
  RefreshCw,
  Search,
  Loader2,
  Trash2
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import AirportsDialog from "./airports-dialog"

interface LocationsTableProps {
  locations: SelectCircuitLocation[]
  circuitId: string
  circuit: SelectCircuit
}

type SortField = "name" | "type" | "airportCode" | "distanceFromCircuit"
type SortOrder = "asc" | "desc"

export default function LocationsTable({
  locations,
  circuitId,
  circuit
}: LocationsTableProps) {
  const [isSyncing, setIsSyncing] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [showAirportsDialog, setShowAirportsDialog] = useState(false)
  const [sortField, setSortField] = useState<SortField>("distanceFromCircuit")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()

  async function handleSyncAirportCoordinates() {
    if (isSyncing) return
    setIsSyncing(true)
    const toastId = toast.loading("Syncing airport coordinates...")

    try {
      const result = await syncAirportCoordinatesAction()
      if (result.isSuccess) {
        toast.success(result.message, { id: toastId })
        router.refresh()
      } else {
        toast.error(result.message || "Failed to sync coordinates", {
          id: toastId
        })
      }
    } catch (error) {
      console.error("Error syncing coordinates:", error)
      toast.error("An error occurred while syncing coordinates", {
        id: toastId
      })
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleDeleteLocation(id: string) {
    if (isDeleting) return
    setIsDeleting(id)
    const toastId = toast.loading("Deleting location...")

    try {
      const result = await deleteCircuitLocationAction(id)
      if (result.isSuccess) {
        toast.success(result.message, { id: toastId })
        router.refresh()
      } else {
        toast.error(result.message || "Failed to delete location", {
          id: toastId
        })
      }
    } catch (error) {
      console.error("Error deleting location:", error)
      toast.error("An error occurred while deleting location", { id: toastId })
    } finally {
      setIsDeleting(null)
    }
  }

  async function handleAddAirports(
    airports: Array<{
      name: string
      latitude: number
      longitude: number
      distance: number
      placeId?: string
      airportCode?: string
    }>
  ) {
    const toastId = toast.loading("Adding airports...")
    try {
      // Insert each airport as a circuit location
      for (const airport of airports) {
        await fetch("/api/circuits/locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            circuitId,
            type: "airport",
            name: airport.name,
            latitude: airport.latitude.toString(),
            longitude: airport.longitude.toString(),
            distanceFromCircuit: airport.distance.toString(),
            placeId: airport.placeId,
            airportCode: airport.airportCode,
            transferTime: `${Math.round(airport.distance / 60)} hour(s)`
          })
        })
      }
      toast.success(`Added ${airports.length} airports`, { id: toastId })
      router.refresh()
    } catch (error) {
      console.error("Error adding airports:", error)
      toast.error("Failed to add airports", { id: toastId })
      throw error // Re-throw to be handled by the dialog
    }
  }

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const hasCircuitCoordinates = !!(circuit.latitude && circuit.longitude)

  const filteredAndSortedLocations = locations
    .filter(location => {
      const searchLower = searchQuery.toLowerCase()
      return (
        location.name.toLowerCase().includes(searchLower) ||
        location.type.toLowerCase().includes(searchLower) ||
        location.airportCode?.toLowerCase().includes(searchLower) ||
        location.distanceFromCircuit?.toString().includes(searchLower)
      )
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
        case "airportCode":
          comparison = (a.airportCode || "").localeCompare(b.airportCode || "")
          break
        case "distanceFromCircuit":
          comparison =
            (Number(a.distanceFromCircuit) || 0) -
            (Number(b.distanceFromCircuit) || 0)
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold">Locations</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleSyncAirportCoordinates}
            variant="outline"
            disabled={isSyncing}
          >
            {isSyncing ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 size-4" />
            )}
            {isSyncing ? "Syncing..." : "Sync Coordinates"}
          </Button>
          <Button
            onClick={() => setShowAirportsDialog(true)}
            disabled={!hasCircuitCoordinates}
            title={
              !hasCircuitCoordinates ? "Circuit coordinates are required" : ""
            }
          >
            <Search className="mr-2 size-4" />
            Find Nearby Airports
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <Input
          id="search"
          placeholder="Search locations..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button
                variant="ghost"
                className="hover:text-primary p-0 font-bold"
                onClick={() => toggleSort("name")}
              >
                Name
                {sortField === "name" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="hover:text-primary p-0 font-bold"
                onClick={() => toggleSort("type")}
              >
                Type
                {sortField === "type" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
            </TableHead>
            <TableHead>
              <Button
                variant="ghost"
                className="hover:text-primary p-0 font-bold"
                onClick={() => toggleSort("airportCode")}
              >
                Airport Code
                {sortField === "airportCode" && (
                  <span className="ml-1">
                    {sortOrder === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </Button>
            </TableHead>
            <TableHead>Coordinates</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredAndSortedLocations.map(location => (
            <TableRow key={location.id}>
              <TableCell>{location.name}</TableCell>
              <TableCell>{location.type}</TableCell>
              <TableCell>{location.airportCode || "-"}</TableCell>
              <TableCell>
                {location.latitude && location.longitude
                  ? `${location.latitude}, ${location.longitude}`
                  : "-"}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteLocation(location.id)}
                  disabled={isDeleting === location.id}
                >
                  {isDeleting === location.id ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="text-destructive size-4" />
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AirportsDialog
        isOpen={showAirportsDialog}
        onClose={() => setShowAirportsDialog(false)}
        onAddAirports={handleAddAirports}
        circuitLatitude={Number(circuit.latitude)}
        circuitLongitude={Number(circuit.longitude)}
      />
    </Card>
  )
}
