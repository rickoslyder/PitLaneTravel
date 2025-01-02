"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { TransformedFlightOffer } from "@/types/duffel"

interface FlightFiltersProps {
  offers: TransformedFlightOffer[]
  onFilterChange: (filtered: TransformedFlightOffer[]) => void
  onSortChange: (sorted: TransformedFlightOffer[]) => void
}

interface FilterState {
  maxStops: number
  airlines: string[]
  maxPrice: number
  departureTime: string
  sortBy: "price" | "duration" | "departure" | "arrival"
}

export function FlightFilters({
  offers,
  onFilterChange,
  onSortChange
}: FlightFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    maxStops: 2,
    airlines: [],
    maxPrice: Math.max(...offers.map(o => parseFloat(o.total_amount))),
    departureTime: "any",
    sortBy: "price"
  })

  // Get unique airlines from offers
  const uniqueAirlines = Array.from(
    new Set(offers.map(offer => offer.airline.name))
  ).sort()

  // Apply filters
  const applyFilters = (offers: TransformedFlightOffer[]) => {
    return offers.filter(offer => {
      // Filter by stops
      if (offer.slices[0].segments.length - 1 > filters.maxStops) return false

      // Filter by airline
      if (
        filters.airlines.length > 0 &&
        !filters.airlines.includes(offer.airline.name)
      )
        return false

      // Filter by price
      if (parseFloat(offer.total_amount) > filters.maxPrice) return false

      // Filter by departure time
      const departureHour = parseInt(
        offer.slices[0].departure.time.split(":")[0]
      )
      switch (filters.departureTime) {
        case "morning": // 6 AM - 12 PM
          if (departureHour < 6 || departureHour >= 12) return false
          break
        case "afternoon": // 12 PM - 6 PM
          if (departureHour < 12 || departureHour >= 18) return false
          break
        case "evening": // 6 PM - 12 AM
          if (departureHour < 18) return false
          break
        case "night": // 12 AM - 6 AM
          if (departureHour >= 6) return false
          break
      }

      return true
    })
  }

  // Apply sorting
  const applySorting = (offers: TransformedFlightOffer[]) => {
    return [...offers].sort(
      (a: TransformedFlightOffer, b: TransformedFlightOffer) => {
        switch (filters.sortBy) {
          case "price":
            return parseFloat(a.total_amount) - parseFloat(b.total_amount)
          case "duration":
            return a.slices[0].duration.localeCompare(b.slices[0].duration)
          case "departure":
            return a.slices[0].departure.time.localeCompare(
              b.slices[0].departure.time
            )
          case "arrival":
            return a.slices[0].arrival.time.localeCompare(
              b.slices[0].arrival.time
            )
          default:
            return 0
        }
      }
    )
  }

  // Update filters and trigger parent updates
  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)

    const filteredOffers = applyFilters(offers)
    onFilterChange(filteredOffers)
    onSortChange(applySorting(filteredOffers))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Maximum Stops</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[filters.maxStops]}
            onValueChange={([value]) => updateFilters({ maxStops: value })}
            max={2}
            step={1}
          />
          <span className="w-12 text-right">
            {filters.maxStops === 0
              ? "Direct"
              : `${filters.maxStops} stop${filters.maxStops > 1 ? "s" : ""}`}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Airlines</Label>
        <div className="flex flex-wrap gap-2">
          {uniqueAirlines.map(airline => (
            <Button
              key={airline}
              variant={
                filters.airlines.includes(airline) ? "default" : "outline"
              }
              size="sm"
              onClick={() => {
                const airlines = filters.airlines.includes(airline)
                  ? filters.airlines.filter(a => a !== airline)
                  : [...filters.airlines, airline]
                updateFilters({ airlines })
              }}
            >
              {airline}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Maximum Price ({offers[0]?.total_currency})</Label>
        <div className="flex items-center gap-4">
          <Slider
            value={[filters.maxPrice]}
            onValueChange={([value]) => updateFilters({ maxPrice: value })}
            min={Math.min(...offers.map(o => parseFloat(o.total_amount)))}
            max={Math.max(...offers.map(o => parseFloat(o.total_amount)))}
            step={10}
          />
          <span className="w-20 text-right">{filters.maxPrice.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Departure Time</Label>
        <Select
          value={filters.departureTime}
          onValueChange={departureTime => updateFilters({ departureTime })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any time</SelectItem>
            <SelectItem value="morning">Morning (6 AM - 12 PM)</SelectItem>
            <SelectItem value="afternoon">Afternoon (12 PM - 6 PM)</SelectItem>
            <SelectItem value="evening">Evening (6 PM - 12 AM)</SelectItem>
            <SelectItem value="night">Night (12 AM - 6 AM)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Sort By</Label>
        <Select
          value={filters.sortBy}
          onValueChange={sortBy =>
            updateFilters({ sortBy: sortBy as FilterState["sortBy"] })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price</SelectItem>
            <SelectItem value="duration">Duration</SelectItem>
            <SelectItem value="departure">Departure Time</SelectItem>
            <SelectItem value="arrival">Arrival Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
