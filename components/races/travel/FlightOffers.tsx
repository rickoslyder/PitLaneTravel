"use client"

import { sendGTMEvent } from "@next/third-parties/google"
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
            let flightDetails =
              offer.slices
                ?.map(slice =>
                  slice.segments
                    .map(segment => segment.flight_number)
                    .join(", ")
                )
                .join(" / ") || "Flight number not available"
            sendGTMEvent({
              event: "add_to_cart",
              user_data: {
                external_id: userId ?? null
              },
              x_fb_ud_external_id: userId ?? null,
              items: [
                {
                  item_name: flightDetails,
                  quantity: 1,
                  price: offer.total_amount,
                  item_category: "flight",
                  item_brand: offer.airline.name
                }
              ]
            })
          }}
          isSelected={selectedOfferId === offer.id}
          userId={userId ?? undefined}
        />
      ))}
    </div>
  )
}
