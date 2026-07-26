"use server"

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { duffel } from "@/lib/duffel"
import { stripe } from "@/lib/stripe"
import { features } from "@/config/features"
import {
  flightChargeTotal,
  flightServiceFee,
  isSupportedCurrency,
  toStripeMinorUnits
} from "@/config/pricing"
import { findBookingByOffer } from "@/db/queries/flight-bookings"

/**
 * Creates the Stripe PaymentIntent that must succeed before a Duffel order is placed.
 *
 * The amount is derived server-side from the live Duffel offer — never from the client —
 * because it determines what the customer is charged.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!features.flightsBookingEnabled) {
      return NextResponse.json(
        { error: "Flight booking is not yet available" },
        { status: 503 }
      )
    }

    const { offerId } = await request.json()
    if (!offerId || typeof offerId !== "string") {
      return NextResponse.json({ error: "offerId is required" }, { status: 400 })
    }

    const { data: offer } = await duffel.offers.get(offerId)
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }
    if (new Date(offer.expires_at) <= new Date()) {
      return NextResponse.json(
        { error: "This offer has expired. Please search again." },
        { status: 409 }
      )
    }

    if (!isSupportedCurrency(offer.total_currency)) {
      return NextResponse.json(
        {
          error: `We can't process payments in ${offer.total_currency} yet. Please search again in a supported currency.`
        },
        { status: 400 }
      )
    }

    // Don't let a retry mint a second PaymentIntent for an offer that is already booked
    // (or mid-booking): the customer would be charged twice for one flight.
    const existing = await findBookingByOffer(offerId, userId)
    if (existing && existing.status !== "failed") {
      return NextResponse.json(
        {
          error:
            existing.status === "confirmed"
              ? "This flight is already booked."
              : "A booking for this fare is already in progress. Please wait a moment before trying again.",
          bookingId: existing.id
        },
        { status: 409 }
      )
    }

    const currency = offer.total_currency
    const serviceFee = flightServiceFee(offer.total_amount)
    const chargeTotal = flightChargeTotal(offer.total_amount)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: toStripeMinorUnits(chargeTotal, currency),
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      // Read back on the booking route to authorise the Duffel order.
      metadata: {
        userId,
        offerId,
        offerTotal: offer.total_amount,
        serviceFee,
        chargeTotal,
        currency
      }
    })

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      offerTotal: offer.total_amount,
      serviceFee,
      chargeTotal,
      currency
    })
  } catch (error) {
    console.error("Failed to create flight payment intent:", error)
    return NextResponse.json(
      { error: "Failed to start payment" },
      { status: 500 }
    )
  }
}
