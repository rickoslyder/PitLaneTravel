"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { TransformedFlightOffer } from "@/types/duffel"
import { FlightSearch } from "@/components/races/travel/FlightSearch"
import { FlightOffers } from "@/components/races/travel/FlightOffers"
import { FlightFilters } from "@/components/races/travel/FlightFilters"
import { FlightBookingForm } from "@/components/races/travel/FlightBookingForm"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SelectCircuitLocation } from "@/db/schema"

interface FlightSearchContainerProps {
  races: RaceWithCircuitAndSeries[]
}

export function FlightSearchContainer({ races }: FlightSearchContainerProps) {
  const [selectedRace, setSelectedRace] = useState<RaceWithCircuitAndSeries>()
  const [isSearching, setIsSearching] = useState(false)
  const [offers, setOffers] = useState<TransformedFlightOffer[]>([])
  const [filteredOffers, setFilteredOffers] = useState<
    TransformedFlightOffer[]
  >([])
  const [selectedOffer, setSelectedOffer] = useState<TransformedFlightOffer>()
  const [passengerCount, setPassengerCount] = useState(1)

  const handleSearch = async (searchParams: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    passengers: number
  }) => {
    setIsSearching(true)
    setPassengerCount(searchParams.passengers)

    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(searchParams)
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "Failed to search flights")
      }

      setOffers(data.offers)
      setFilteredOffers(data.offers)
    } catch (error) {
      console.error("Error searching flights:", error)
      toast.error(
        error instanceof Error ? error.message : "Failed to search flights"
      )
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Select Race</Label>
        <Select
          value={selectedRace?.id}
          onValueChange={value =>
            setSelectedRace(races.find(race => race.id === value))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a race weekend" />
          </SelectTrigger>
          <SelectContent>
            {races.map(race => (
              <SelectItem key={race.id} value={race.id}>
                {race.name} - {new Date(race.date).toLocaleDateString()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedRace && (
        <FlightSearch
          race={selectedRace}
          nearestAirports={
            selectedRace.circuit?.locations?.filter(
              loc => loc.type === "airport"
            ) || []
          }
        />
      )}

      {offers.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-4">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <FlightFilters
                offers={offers}
                onFilterChange={setFilteredOffers}
                onSortChange={setFilteredOffers}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Available Flights</CardTitle>
            </CardHeader>
            <CardContent>
              <FlightOffers
                offers={filteredOffers}
                selectedOfferId={selectedOffer?.id}
                onSelect={setSelectedOffer}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {selectedOffer && (
        <FlightBookingForm
          offer={selectedOffer}
          passengerCount={passengerCount}
          onClose={() => setSelectedOffer(undefined)}
        />
      )}
    </div>
  )
}
