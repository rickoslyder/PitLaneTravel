import { NextResponse } from "next/server"
import { Duffel } from "@duffel/api"

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { origin, destination, departure_date, return_date, passengers } =
      body

    // Create an offer request
    const offerRequest = await duffel.offerRequests.create({
      slices: return_date
        ? [
            {
              origin,
              destination,
              departure_date
            },
            {
              origin: destination,
              destination: origin,
              departure_date: return_date
            }
          ]
        : [
            {
              origin,
              destination,
              departure_date
            }
          ],
      passengers: Array(passengers).fill({
        type: "adult"
      }),
      cabin_class: "economy"
    })

    // Get the offers
    const { data: offers } = await duffel.offers.list({
      offer_request_id: offerRequest.data.id,
      sort: "total_amount"
    })

    // Transform the offers into a simpler format
    const transformedOffers = offers.map(offer => ({
      id: offer.id,
      total_amount: offer.total_amount,
      total_currency: offer.total_currency,
      departure: {
        airport: offer.slices[0].origin.iata_code,
        time: offer.slices[0].departing_at
      },
      arrival: {
        airport: offer.slices[0].destination.iata_code,
        time: offer.slices[0].arriving_at
      },
      airline: {
        name: offer.owner.name,
        logo_url: offer.owner.logo_url
      },
      duration: `${Math.floor(offer.slices[0].duration / 60)}h ${
        offer.slices[0].duration % 60
      }m`
    }))

    return NextResponse.json({ offers: transformedOffers })
  } catch (error) {
    console.error("Error searching flights:", error)
    return NextResponse.json(
      { error: "Failed to search flights" },
      { status: 500 }
    )
  }
}
