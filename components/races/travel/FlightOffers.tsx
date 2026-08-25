"use client"

import { captureAnalyticsEvent } from "@/lib/analytics/capture"
import { FlightDetails } from "./FlightDetails"
import { TransformedFlightOffer } from "@/types/duffel"

interface FlightOffersProps {
  offers: TransformedFlightOffer[]
  selectedOfferId?: string
  onSelect: (offer: TransformedFlightOffer) => void
  userId?: string
}

export function FlightOffers({
  offers,
  selectedOfferId,
  onSelect,
  userId
}: FlightOffersProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-medium">Available Flights</h3>
      {offers.map(offer => (
        <FlightDetails
          key={offer.id}
          flight={offer}
          onSelect={() => {
            onSelect(offer)
            captureAnalyticsEvent({ event: "flight offer selected" })
          }}
          isSelected={selectedOfferId === offer.id}
          userId={userId ?? undefined}
        />
      ))}
    </div>
  )
}
