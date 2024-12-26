"use client"

import { RaceWithDetails } from "@/types/race"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import {
  CalendarIcon,
  Plane,
  ArrowRight,
  RefreshCcw,
  Search
} from "lucide-react"
import { useState } from "react"
import dynamic from "next/dynamic"
import { SelectCircuitLocation } from "@/db/schema"
import { useUser } from "@clerk/nextjs"
import {
  syncAirportCoordinatesAction,
  findNearbyAirportsAction
} from "@/actions/db/airports-actions"
import { toast } from "sonner"
import { AirportSearch } from "./AirportSearch"

const Map = dynamic(() => import("./Map"), { ssr: false })

interface FlightSearchProps {
  race: RaceWithDetails
  nearestAirports: SelectCircuitLocation[]
}

export function FlightSearch({ race, nearestAirports }: FlightSearchProps) {
  const { user, isLoaded } = useUser()
  const [departureDate, setDepartureDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [origin, setOrigin] = useState("")

  async function handleSyncAirports() {
    const result = await syncAirportCoordinatesAction()
    if (result.isSuccess) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  async function handleFindNearbyAirports() {
    if (!race.circuit?.latitude || !race.circuit?.longitude) {
      toast.error("Circuit coordinates are required")
      return
    }

    const result = await findNearbyAirportsAction(
      race.circuit.id,
      Number(race.circuit.latitude),
      Number(race.circuit.longitude)
    )
    if (result.isSuccess) {
      toast.success(result.message)
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Search Flights
            {isLoaded && user?.publicMetadata?.isAdmin === true && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSyncAirports}
                >
                  <RefreshCcw className="mr-2 size-4" />
                  Sync
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleFindNearbyAirports}
                >
                  <Search className="mr-2 size-4" />
                  Find
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>From</Label>
            <AirportSearch
              value={origin}
              onValueChange={setOrigin}
              placeholder="Enter departure airport"
            />
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <div className="grid grid-cols-2 gap-2">
              {nearestAirports.slice(0, 2).map(airport => (
                <Button
                  key={airport.id}
                  variant="outline"
                  className="justify-start"
                >
                  <div className="flex items-center gap-2">
                    <Plane className="size-4" />
                    <div className="text-left">
                      <div className="font-medium">{airport.airportCode}</div>
                      <div className="text-muted-foreground text-xs">
                        {airport.distanceFromCircuit}km
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Departure</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !departureDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {departureDate ? (
                      format(departureDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={departureDate}
                    onSelect={setDepartureDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Return</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !returnDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {returnDate ? (
                      format(returnDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={returnDate}
                    onSelect={setReturnDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button className="w-full">Search Flights</Button>

          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium">Travel Tips</div>
            <div className="text-muted-foreground space-y-2 text-sm">
              <p>
                • Book early for the best rates - prices typically increase 2-3
                months before the race
              </p>
              <p>
                • Consider flying into {nearestAirports[0]?.airportCode} for the
                shortest transfer time ({nearestAirports[0]?.transferTime})
              </p>
              <p>
                • Many F1 fans arrive Thursday and leave Monday to enjoy the
                full race weekend
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Travel Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-[16/9] overflow-hidden rounded-lg border">
            <Map
              center={
                [
                  Number(race.circuit?.longitude || 0),
                  Number(race.circuit?.latitude || 0)
                ] as [number, number]
              }
              airports={nearestAirports}
            />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {nearestAirports.map(airport => (
              <div
                key={airport.id}
                className="flex items-center gap-4 rounded-lg border p-4"
              >
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
                  <Plane className="text-primary size-6" />
                </div>
                <div>
                  <div className="font-medium">
                    {airport.airportCode} - {airport.name}
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <span>{airport.transferTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
