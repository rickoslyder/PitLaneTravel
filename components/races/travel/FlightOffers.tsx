"use client"

import { FlightDetails } from "./FlightDetails"
import { TransformedFlightOffer } from "@/types/duffel"

interface FlightOffersProps {
  offers: TransformedFlightOffer[]
  selectedOfferId?: string
  onSelect: (offer: TransformedFlightOffer) => void
}

export function FlightOffers({
  offers,
  selectedOfferId,
  onSelect
}: FlightOffersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Available Flights</h3>
      {offers.map(offer => (
        <FlightDetails
          key={offer.id}
          flight={offer}
          onSelect={() => onSelect(offer)}
          isSelected={selectedOfferId === offer.id}
        />
      ))}
    </div>
  )
}
