import { NextResponse } from "next/server"
import { Duffel } from "@duffel/api"
import {
  CreateOfferRequest,
  CreateOfferRequestSlice,
  OfferRequest,
  Offer,
  Place,
  Airport,
  City
} from "@duffel/api/types"
import { TransformedFlightOffer, DuffelPassengerType } from "@/types/duffel"

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || ""
})

interface SearchRequestBody {
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  passengers: number
}

export const maxDuration = 60

export async function POST(request: Request) {
  try {
    const {
      origin,
      destination,
      departureDate,
      returnDate,
      passengers
    }: SearchRequestBody = await request.json()

    if (!origin || !destination || !departureDate || !passengers) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const departureSlice: CreateOfferRequestSlice = {
      origin,
      destination,
      departure_date: new Date(departureDate).toISOString().split("T")[0],
      arrival_time: null,
      departure_time: null
    }

    const slices: CreateOfferRequestSlice[] = [departureSlice]

    if (returnDate) {
      const returnSlice: CreateOfferRequestSlice = {
        origin: destination,
        destination: origin,
        departure_date: new Date(returnDate).toISOString().split("T")[0],
        arrival_time: null,
        departure_time: null
      }
      slices.push(returnSlice)
    }

    const offerRequest: CreateOfferRequest = {
      slices,
      passengers: Array(passengers)
        .fill(null)
        .map(() => ({ type: "adult" })),
      cabin_class: "economy"
    }

    const offers = await duffel.offerRequests.create(offerRequest)
    const offerResponse = offers.data as OfferRequest

    // Transform offers into a simpler format for the frontend
    const transformedOffers: TransformedFlightOffer[] =
      offerResponse.offers.map(offer => {
        const originPlace = offer.slices[0].origin as Airport & { city?: City }
        const destinationPlace = offer.slices[0].destination as Airport & {
          city?: City
        }

        // Default duration in ISO 8601 duration format if not provided
        const defaultDuration = "PT0H"

        return {
          id: offer.id,
          total_amount: offer.total_amount,
          total_currency: offer.total_currency,
          base_amount: offer.base_amount,
          base_currency: offer.base_currency,
          tax_amount: offer.tax_amount || undefined,
          tax_currency: offer.tax_currency || undefined,
          airline: {
            name: offer.owner.name,
            iata_code: offer.owner.iata_code || "",
            logo_symbol_url: offer.owner.logo_symbol_url || undefined,
            logo_lockup_url: offer.owner.logo_lockup_url || undefined,
            conditions_of_carriage_url:
              offer.owner.conditions_of_carriage_url || undefined
          },
          slices: offer.slices.map(slice => {
            const originPlace = slice.origin as Airport & { city?: City }
            const destinationPlace = slice.destination as Airport & {
              city?: City
            }
            return {
              departure: {
                airport: originPlace.iata_code || "",
                city: originPlace.city?.name || undefined,
                time: slice.segments[0].departing_at,
                terminal: (originPlace as any).terminal || undefined
              },
              arrival: {
                airport: destinationPlace.iata_code || "",
                city: destinationPlace.city?.name || undefined,
                time: slice.segments[slice.segments.length - 1].arriving_at,
                terminal: (destinationPlace as any).terminal || undefined
              },
              duration: slice.duration || defaultDuration,
              segments: slice.segments.map(segment => {
                const segmentOrigin = segment.origin as Airport
                const segmentDestination = segment.destination as Airport
                return {
                  flight_number: segment.operating_carrier_flight_number,
                  aircraft: segment.aircraft?.name,
                  departure: {
                    airport: segmentOrigin.iata_code || "",
                    city: (segmentOrigin as any).city?.name || undefined,
                    time: segment.departing_at,
                    terminal: (segmentOrigin as any).terminal || undefined
                  },
                  arrival: {
                    airport: segmentDestination.iata_code || "",
                    city: (segmentDestination as any).city?.name || undefined,
                    time: segment.arriving_at,
                    terminal: (segmentDestination as any).terminal || undefined
                  },
                  airline: {
                    name: segment.operating_carrier.name,
                    iata_code: segment.operating_carrier.iata_code || "",
                    logo_symbol_url:
                      segment.operating_carrier.logo_symbol_url || undefined,
                    logo_lockup_url:
                      segment.operating_carrier.logo_lockup_url || undefined
                  },
                  duration: segment.duration || defaultDuration,
                  operating_carrier: {
                    name: segment.operating_carrier.name,
                    iata_code: segment.operating_carrier.iata_code || ""
                  },
                  marketing_carrier: segment.marketing_carrier
                    ? {
                        name: segment.marketing_carrier.name,
                        iata_code: segment.marketing_carrier.iata_code || ""
                      }
                    : undefined
                }
              })
            }
          }),
          conditions: {
            changeable:
              offer.conditions?.change_before_departure?.allowed || false,
            refundable:
              offer.conditions?.refund_before_departure?.allowed || false,
            change_fee:
              offer.conditions?.change_before_departure?.penalty_amount ||
              undefined,
            refund_fee:
              offer.conditions?.refund_before_departure?.penalty_amount ||
              undefined
          },
          baggage: {
            checked:
              offer.slices[0].segments[0].passengers?.[0]?.baggages
                ?.filter(b => b.type === "checked")
                .map(b => ({
                  type: "checked",
                  quantity: b.quantity
                })) || [],
            carry_on:
              offer.slices[0].segments[0].passengers?.[0]?.baggages
                ?.filter(b => b.type === "carry_on")
                .map(b => ({
                  type: "carry_on",
                  quantity: b.quantity
                })) || []
          },
          payment_requirements: {
            requires_instant_payment:
              offer.payment_requirements.requires_instant_payment,
            price_guarantee_expires_at:
              offer.payment_requirements.price_guarantee_expires_at ||
              undefined,
            payment_required_by:
              offer.payment_requirements.payment_required_by || undefined
          },
          expires_at: offer.expires_at,
          created_at: offer.created_at,
          passenger_identity_documents_required:
            offer.passenger_identity_documents_required,
          passengers: offer.passengers.map(passenger => ({
            id: passenger.id,
            type: passenger.type || "adult"
          })) as Array<{ id: string; type: DuffelPassengerType }>
        }
      })

    return NextResponse.json({
      success: true,
      offers: transformedOffers
    })
  } catch (error) {
    console.error("Error searching flights:", error)
    return NextResponse.json(
      { error: "Failed to search flights" },
      { status: 500 }
    )
  }
}
