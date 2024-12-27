"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search } from "lucide-react"
import { findNearbyAirportsAction } from "@/actions/db/airports-actions"
import { toast } from "sonner"
import MapPreview from "./map-preview"
import { AirportSearch } from "@/components/races/travel/AirportSearch"

interface Airport {
  name: string
  latitude: number
  longitude: number
  distance: number
  placeId?: string
  airportCode?: string
}

interface AirportsDialogProps {
  isOpen: boolean
  onClose: () => void
  onAddAirports: (airports: Airport[]) => Promise<void>
  circuitLatitude: number
  circuitLongitude: number
}

export default function AirportsDialog({
  isOpen,
  onClose,
  onAddAirports,
  circuitLatitude,
  circuitLongitude
}: AirportsDialogProps) {
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [radius, setRadius] = useState(200)
  const [airports, setAirports] = useState<Airport[]>([])
  const [selectedAirports, setSelectedAirports] = useState<Set<string>>(
    new Set()
  )
  const [mapInitialized, setMapInitialized] = useState(false)
  const [manualAirport, setManualAirport] = useState("")

  async function handleSearch(code?: string) {
    if (isSearching) return
    setIsSearching(true)
    const toastId = toast.loading("Searching for airports...")

    try {
      const result = await findNearbyAirportsAction(
        circuitLatitude,
        circuitLongitude,
        radius,
        code
      )

      if (!result.isSuccess) {
        toast.error(result.message, { id: toastId })
        setAirports([])
        setSelectedAirports(new Set())
        return
      }

      const foundAirports = result.data
      console.log("Found airports:", foundAirports)

      if (foundAirports.length === 0) {
        toast.info("No airports found", { id: toastId })
        return
      }

      if (code) {
        setAirports(prev => {
          const newAirports = [...prev]
          foundAirports.forEach(airport => {
            if (!prev.some(a => a.airportCode === airport.airportCode)) {
              newAirports.push(airport)
            }
          })
          return newAirports.sort((a, b) => a.distance - b.distance)
        })
      } else {
        setAirports(foundAirports)
      }

      setSelectedAirports(prev => {
        const newSelected = new Set(prev)
        foundAirports
          .filter(airport => airport.airportCode)
          .forEach(airport => newSelected.add(airport.name))
        return newSelected
      })

      toast.success(`Found ${foundAirports.length} airports`, { id: toastId })
    } catch (error) {
      console.error("Error searching for airports:", error)
      toast.error("Failed to search for airports", { id: toastId })
    } finally {
      setIsSearching(false)
    }
  }

  async function handleAddSelected() {
    const selectedAirportsList = airports.filter(airport =>
      selectedAirports.has(airport.name)
    )

    if (selectedAirportsList.length === 0) {
      toast.error("Please select at least one airport")
      return
    }

    setIsAdding(true)
    try {
      await onAddAirports(selectedAirportsList)
      onClose()
    } catch (error) {
      console.error("Error adding airports:", error)
      toast.error("Failed to add selected airports")
    } finally {
      setIsAdding(false)
    }
  }

  function toggleAirport(airportName: string) {
    const newSelected = new Set(selectedAirports)
    if (newSelected.has(airportName)) {
      newSelected.delete(airportName)
    } else {
      newSelected.add(airportName)
    }
    setSelectedAirports(newSelected)
  }

  function handleManualAdd(code: string) {
    // Find if airport already exists in the list
    const exists = airports.some(a => a.airportCode === code)
    if (exists) {
      toast.info("This airport is already in the list")
      return
    }

    setManualAirport(code)
    // The AirportSearch component will give us the IATA code
    // We'll get the full airport details from the Duffel API in handleSearch
    handleSearch(code)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col">
        <DialogHeader>
          <DialogTitle>Find Nearby Airports</DialogTitle>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-y-auto px-2">
          <div className="flex flex-col gap-4">
            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="radius">Search Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  value={radius}
                  onChange={e => setRadius(Number(e.target.value))}
                  min={1}
                  max={500}
                />
              </div>
              <Button onClick={() => handleSearch()} disabled={isSearching}>
                {isSearching ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Search className="mr-2 size-4" />
                )}
                {isSearching ? "Searching..." : "Search Area"}
              </Button>
            </div>

            <div className="flex items-end gap-4">
              <div className="flex-1 space-y-2">
                <Label>Manual Airport Search</Label>
                <AirportSearch
                  value={manualAirport}
                  onValueChange={handleManualAdd}
                  placeholder="Search for a specific airport..."
                />
              </div>
            </div>
          </div>

          <div className="h-[250px]">
            <MapPreview
              circuitLatitude={circuitLatitude}
              circuitLongitude={circuitLongitude}
              radius={radius}
              airports={airports}
              onMapInitialized={() => setMapInitialized(true)}
            />
          </div>

          {airports.length > 0 && (
            <div className="space-y-2 rounded-md border p-4">
              <div className="text-muted-foreground mb-2 text-sm">
                Found {airports.length} airports
              </div>
              <div className="space-y-2">
                {airports.map(airport => (
                  <label
                    key={airport.name}
                    className="flex items-center space-x-3 space-y-0"
                  >
                    <Checkbox
                      checked={selectedAirports.has(airport.name)}
                      onCheckedChange={() => toggleAirport(airport.name)}
                    />
                    <div className="flex-1 space-y-1">
                      <div className="text-sm font-medium">
                        {airport.name}
                        {airport.airportCode ? (
                          <code className="bg-muted ml-2 rounded px-1">
                            {airport.airportCode}
                          </code>
                        ) : null}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {airport.distance}km away
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-4 border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAddSelected} disabled={isAdding}>
            {isAdding ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {isAdding
              ? "Adding..."
              : `Add ${selectedAirports.size} Airport${
                  selectedAirports.size === 1 ? "" : "s"
                }`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
