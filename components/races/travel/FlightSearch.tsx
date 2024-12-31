"use client"

import { RaceWithCircuitAndSeries } from "@/types/database"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip"
import { subDays, addDays } from "date-fns"

const Map = dynamic(() => import("./Map"), { ssr: false })

interface FlightSearchProps {
  race: RaceWithCircuitAndSeries
  nearestAirports: SelectCircuitLocation[]
}

export function FlightSearch({ race, nearestAirports }: FlightSearchProps) {
  const { user, isLoaded } = useUser()
  const [departureDate, setDepartureDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [origin, setOrigin] = useState("")

  // Calculate recommended date ranges
  const raceDate = new Date(race.date)
  const earliestDepartureDate = subDays(raceDate, 14) // 2 weeks before race
  const latestReturnDate = addDays(raceDate, 14) // 2 weeks after race

  // Calculate race weekend dates
  const thursdayDate = subDays(raceDate, 3)
  const fridayDate = subDays(raceDate, 2)
  const saturdayDate = subDays(raceDate, 1)

  // Important dates for calendar highlighting
  const raceWeekendDates = [
    { date: thursdayDate, description: "Paddock Club & VIP Events" },
    { date: fridayDate, description: "Practice Sessions" },
    { date: saturdayDate, description: "Qualifying/Sprint" },
    { date: raceDate, description: "Race Day" }
  ]

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
      Number(race.circuit.latitude),
      Number(race.circuit.longitude),
      200
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
              {nearestAirports
                .sort(
                  (a, b) =>
                    Number(a.distanceFromCircuit) -
                    Number(b.distanceFromCircuit)
                )
                .map(airport => (
                  <TooltipProvider key={airport.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                        >
                          <div className="flex w-full items-center gap-2">
                            <Plane className="size-4 shrink-0" />
                            <div className="min-w-0 flex-1 truncate text-left">
                              <div className="truncate font-medium">
                                {airport.airportCode} (
                                {airport.distanceFromCircuit}km)
                              </div>
                              <div className="text-muted-foreground truncate text-xs">
                                {airport.name}
                              </div>
                            </div>
                          </div>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{airport.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
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
                    defaultMonth={earliestDepartureDate}
                    fromDate={earliestDepartureDate}
                    toDate={raceDate}
                    modifiers={{
                      raceWeekend: raceWeekendDates.map(d => d.date)
                    }}
                    modifiersStyles={{
                      raceWeekend: {
                        backgroundColor: "rgb(225, 6, 0, 0.1)",
                        color: "rgb(225, 6, 0)",
                        fontWeight: "bold"
                      }
                    }}
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
                    defaultMonth={raceDate}
                    fromDate={raceDate}
                    toDate={latestReturnDate}
                    modifiers={{
                      raceWeekend: raceWeekendDates.map(d => d.date)
                    }}
                    modifiersStyles={{
                      raceWeekend: {
                        backgroundColor: "rgb(225, 6, 0, 0.1)",
                        color: "rgb(225, 6, 0)",
                        fontWeight: "bold"
                      }
                    }}
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
              {nearestAirports.length > 1 && (
                <p>
                  • Consider flying into {nearestAirports[0]?.airportCode} for
                  the shortest transfer time ({nearestAirports[0]?.transferTime}
                  )
                </p>
              )}
              <p>
                • Many F1 fans arrive Thursday and leave Monday to enjoy the
                full race weekend
              </p>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <div className="mb-2 font-medium">Race Weekend Schedule</div>
            <div className="text-muted-foreground space-y-2 text-sm">
              {raceWeekendDates.map((date, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="bg-primary/10 size-2 rounded-full" />
                  <span>{format(date.date, "EEE, MMM d")}</span>
                  <span>-</span>
                  <span>{date.description}</span>
                </div>
              ))}
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
