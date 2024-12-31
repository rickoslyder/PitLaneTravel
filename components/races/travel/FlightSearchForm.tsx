"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { AirportSearch } from "./AirportSearch"
import { Airport, RaceWithDetails } from "@/types/race"
import { addDays, subDays, format } from "date-fns"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface FlightSearchFormProps {
  onSearch: (searchParams: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    passengers: number
  }) => void
  loading?: boolean
  nearestAirports: Airport[]
  defaultDestination?: string
  race: RaceWithDetails
}

// Recommend arriving on Wednesday for the full race weekend experience
const RECOMMENDED_ARRIVAL_DAYS = 3 // Wednesday (3 days before Sunday)
const RECOMMENDED_DEPARTURE_DAYS = 1 // Monday (1 day after Sunday)
const MAX_DAYS_BEFORE_RACE = 14 // 2 weeks before race
const MAX_DAYS_AFTER_RACE = 14 // 2 weeks after race

// Schedule information for warnings
const WEEKEND_SCHEDULE = {
  thursday: "Paddock Club & VIP Events",
  friday: "Practice Sessions",
  saturday: "Qualifying/Sprint",
  sunday: "Race Day"
}

export function FlightSearchForm({
  onSearch,
  loading = false,
  nearestAirports = [],
  defaultDestination,
  race
}: FlightSearchFormProps) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState(defaultDestination || "")
  const [departureDate, setDepartureDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [passengers, setPassengers] = useState(1)
  const [dateWarning, setDateWarning] = useState<string>()

  // Calculate recommended date ranges
  const raceDate = new Date(race.date)
  const recommendedArrivalStart = subDays(raceDate, RECOMMENDED_ARRIVAL_DAYS)
  const recommendedDepartureEnd = addDays(raceDate, RECOMMENDED_DEPARTURE_DAYS)
  const earliestDepartureDate = subDays(raceDate, MAX_DAYS_BEFORE_RACE)
  const latestReturnDate = addDays(raceDate, MAX_DAYS_AFTER_RACE)

  // Calculate key dates for the race weekend
  const thursdayDate = subDays(raceDate, 3)
  const fridayDate = subDays(raceDate, 2)
  const saturdayDate = subDays(raceDate, 1)

  const validateDates = (departure?: Date, return_?: Date) => {
    if (!departure) return

    // Check if departure is after race (invalid)
    if (departure > raceDate) {
      setDateWarning("Departure date is after the race")
      return
    }

    // Check if arriving after Thursday (missing events)
    if (departure > thursdayDate) {
      const missingEvents = []
      if (departure > thursdayDate)
        missingEvents.push(WEEKEND_SCHEDULE.thursday)
      if (departure > fridayDate) missingEvents.push(WEEKEND_SCHEDULE.friday)
      if (departure > saturdayDate)
        missingEvents.push(WEEKEND_SCHEDULE.saturday)

      setDateWarning(
        `Late arrival - you'll miss: ${missingEvents.join(", ")}. Consider arriving on ${format(recommendedArrivalStart, "EEEE")} (${format(recommendedArrivalStart, "MMM d")})`
      )
      return
    }

    // Check if arriving too early
    if (departure < subDays(recommendedArrivalStart, 2)) {
      setDateWarning(
        `Consider arriving closer to the race weekend. Recommended arrival is ${format(recommendedArrivalStart, "EEEE")} (${format(recommendedArrivalStart, "MMM d")})`
      )
      return
    }

    // For return flights
    if (return_) {
      // Check if leaving before race (invalid)
      if (return_ < raceDate) {
        setDateWarning("Return date is before the race")
        return
      }

      // Check if leaving too early on race day
      if (return_.toDateString() === raceDate.toDateString()) {
        setDateWarning(
          "Departing on race day might be tight. Consider leaving the next day to avoid missing any race action"
        )
        return
      }

      // Check if staying too long
      if (return_ > recommendedDepartureEnd) {
        setDateWarning(
          `Consider departing closer to the race. Recommended departure is ${format(recommendedDepartureEnd, "EEEE")} (${format(recommendedDepartureEnd, "MMM d")})`
        )
        return
      }
    }

    setDateWarning(undefined)
  }

  const handleDepartureDateChange = (date: Date | undefined) => {
    setDepartureDate(date)
    validateDates(date, returnDate)
  }

  const handleReturnDateChange = (date: Date | undefined) => {
    setReturnDate(date)
    validateDates(departureDate, date)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!departureDate) return

    onSearch({
      origin,
      destination,
      departureDate: departureDate.toISOString(),
      returnDate: returnDate?.toISOString(),
      passengers
    })
  }

  // Get all important dates for the calendar
  const importantDates = [
    {
      date: raceDate,
      highlight: WEEKEND_SCHEDULE.sunday
    },
    {
      date: saturdayDate,
      highlight: WEEKEND_SCHEDULE.saturday
    },
    {
      date: fridayDate,
      highlight: WEEKEND_SCHEDULE.friday
    },
    {
      date: thursdayDate,
      highlight: WEEKEND_SCHEDULE.thursday
    },
    {
      date: recommendedArrivalStart,
      highlight: "Recommended Arrival"
    }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Origin</Label>
          <AirportSearch
            value={origin}
            onValueChange={setOrigin}
            placeholder="Search for origin airport"
          />
        </div>

        <div className="space-y-2">
          <Label>Destination</Label>
          {nearestAirports.length > 0 ? (
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination airport" />
              </SelectTrigger>
              <SelectContent>
                {nearestAirports.map(airport => (
                  <SelectItem key={airport.code} value={airport.code}>
                    {airport.name} ({airport.code}) - {airport.distance}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <AirportSearch
              value={destination}
              onValueChange={setDestination}
              placeholder="Search for destination airport"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label>Departure Date</Label>
          <DatePicker
            date={departureDate}
            onDateChange={handleDepartureDateChange}
            fromDate={earliestDepartureDate}
            toDate={raceDate}
            defaultMonth={earliestDepartureDate}
            minDate={earliestDepartureDate}
            maxDate={raceDate}
            highlightedDates={importantDates}
          />
        </div>

        <div className="space-y-2">
          <Label>Return Date (Optional)</Label>
          <DatePicker
            date={returnDate}
            onDateChange={handleReturnDateChange}
            fromDate={raceDate}
            toDate={latestReturnDate}
            defaultMonth={raceDate}
            minDate={raceDate}
            maxDate={latestReturnDate}
            highlightedDates={[
              {
                date: raceDate,
                highlight: WEEKEND_SCHEDULE.sunday
              },
              {
                date: recommendedDepartureEnd,
                highlight: "Recommended Departure"
              }
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label>Passengers</Label>
          <Select
            value={passengers.toString()}
            onValueChange={value => setPassengers(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select number of passengers" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <SelectItem key={num} value={num.toString()}>
                  {num} {num === 1 ? "Passenger" : "Passengers"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {dateWarning && (
        <Alert>
          <Info className="size-4" />
          <AlertDescription>{dateWarning}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={loading || !origin || !destination || !departureDate}
      >
        {loading ? "Searching..." : "Search Flights"}
      </Button>
    </form>
  )
}
