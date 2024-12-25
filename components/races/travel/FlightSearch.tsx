"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2, Plane } from "lucide-react"
import { format } from "date-fns"
import { Race } from "@/types/race"

interface FlightSearchProps {
  race: Race
  nearestAirports: Array<{
    code: string
    name: string
    distance: string
    transferTime: string
  }>
}

interface FlightOffer {
  id: string
  total_amount: string
  total_currency: string
  departure: {
    airport: string
    time: string
  }
  arrival: {
    airport: string
    time: string
  }
  airline: {
    name: string
    logo_url?: string
  }
  duration: string
}

export function FlightSearch({ race, nearestAirports }: FlightSearchProps) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState(nearestAirports[0]?.code || "")
  const [departDate, setDepartDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [passengers, setPassengers] = useState("1")
  const [isSearching, setIsSearching] = useState(false)
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([])

  const handleSearch = async () => {
    if (!origin || !destination || !departDate) return

    setIsSearching(true)
    try {
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          origin,
          destination,
          departure_date: format(departDate, "yyyy-MM-dd"),
          return_date: returnDate
            ? format(returnDate, "yyyy-MM-dd")
            : undefined,
          passengers: parseInt(passengers)
        })
      })

      const data = await response.json()
      setFlightOffers(data.offers)
    } catch (error) {
      console.error("Error searching flights:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Flights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="origin">From</Label>
                <Input
                  id="origin"
                  placeholder="Enter airport code (e.g., LHR)"
                  value={origin}
                  onChange={e => setOrigin(e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="destination">To</Label>
                <Select value={destination} onValueChange={setDestination}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select airport" />
                  </SelectTrigger>
                  <SelectContent>
                    {nearestAirports.map(airport => (
                      <SelectItem key={airport.code} value={airport.code}>
                        {airport.name} ({airport.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Departure Date</Label>
                <DatePicker date={departDate} onDateChange={setDepartDate} />
              </div>
              <div className="space-y-2">
                <Label>Return Date (Optional)</Label>
                <DatePicker date={returnDate} onDateChange={setReturnDate} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="passengers">Passengers</Label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "passenger" : "passengers"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full"
              onClick={handleSearch}
              disabled={isSearching || !origin || !destination || !departDate}
            >
              {isSearching ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Plane className="mr-2 size-4" />
              )}
              {isSearching ? "Searching..." : "Search Flights"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {flightOffers.length > 0 && (
        <div className="grid gap-4">
          <h3 className="text-lg font-semibold">Available Flights</h3>
          {flightOffers.map(offer => (
            <Card key={offer.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {offer.airline.logo_url && (
                      <img
                        src={offer.airline.logo_url}
                        alt={offer.airline.name}
                        className="size-8 object-contain"
                      />
                    )}
                    <div>
                      <div className="font-medium">{offer.airline.name}</div>
                      <div className="text-muted-foreground text-sm">
                        Duration: {offer.duration}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      {offer.total_amount} {offer.total_currency}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // TODO: Implement booking flow
                      }}
                    >
                      Select
                    </Button>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-8">
                  <div>
                    <div className="text-sm font-medium">Departure</div>
                    <div className="text-2xl font-bold">
                      {offer.departure.time}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {offer.departure.airport}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Arrival</div>
                    <div className="text-2xl font-bold">
                      {offer.arrival.time}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {offer.arrival.airport}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
