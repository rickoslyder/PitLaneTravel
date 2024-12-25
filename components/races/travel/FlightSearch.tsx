"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { FlightSearchForm } from "./FlightSearchForm"
import { FlightOffers } from "./FlightOffers"
import { PassengerForm } from "./PassengerForm"
import { BookingConfirmation } from "./BookingConfirmation"
import { Airport, RaceWithDetails } from "@/types/race"

interface FlightSearchProps {
  race: RaceWithDetails
  nearestAirports: Airport[]
}

interface FlightSearchState {
  step: "search" | "passengers" | "confirmation"
  selectedFlight: any | null
  passengers: any[]
  booking: any | null
}

export function FlightSearch({ race, nearestAirports }: FlightSearchProps) {
  const [loading, setLoading] = useState(false)
  const [flightOffers, setFlightOffers] = useState([])
  const [state, setState] = useState<FlightSearchState>({
    step: "search",
    selectedFlight: null,
    passengers: [],
    booking: null
  })

  const handleSearch = async (searchParams: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    passengers: number
  }) => {
    try {
      setLoading(true)
      const response = await fetch("/api/flights/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...searchParams,
          // If the destination is not provided, use the nearest airport's code
          destination: searchParams.destination || nearestAirports[0]?.code
        })
      })
      const data = await response.json()
      setFlightOffers(data.offers || [])
    } catch (error) {
      console.error("Error searching flights:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFlightSelect = (flight: any) => {
    setState(prev => ({
      ...prev,
      step: "passengers",
      selectedFlight: flight
    }))
  }

  const handlePassengerSubmit = async (passengers: any[]) => {
    try {
      setLoading(true)
      const response = await fetch("/api/flights/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId: state.selectedFlight.id,
          passengers
        })
      })
      const data = await response.json()

      if (data.success) {
        setState(prev => ({
          ...prev,
          step: "confirmation",
          passengers,
          booking: data.booking
        }))
      }
    } catch (error) {
      console.error("Error booking flight:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePassengerCancel = () => {
    setState(prev => ({
      ...prev,
      step: "search",
      selectedFlight: null
    }))
  }

  const handleBookingDone = () => {
    setState({
      step: "search",
      selectedFlight: null,
      passengers: [],
      booking: null
    })
    setFlightOffers([])
  }

  if (state.step === "passengers") {
    return (
      <PassengerForm
        passengerCount={state.selectedFlight.passengers}
        onSubmit={handlePassengerSubmit}
        onCancel={handlePassengerCancel}
      />
    )
  }

  if (state.step === "confirmation" && state.booking) {
    return (
      <BookingConfirmation
        flight={state.selectedFlight}
        passengers={state.passengers}
        onDone={handleBookingDone}
      />
    )
  }

  return (
    <div className="space-y-6">
      <FlightSearchForm
        onSearch={handleSearch}
        loading={loading}
        nearestAirports={nearestAirports}
        defaultDestination={nearestAirports[0]?.code}
        race={race}
      />

      {flightOffers.length > 0 && (
        <FlightOffers
          offers={flightOffers}
          selectedOfferId={state.selectedFlight?.id}
          onSelect={handleFlightSelect}
        />
      )}

      {loading && (
        <div className="flex justify-center">
          <Loader2 className="size-6 animate-spin" />
        </div>
      )}
    </div>
  )
}
