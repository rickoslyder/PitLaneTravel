"use server"

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { duffel } from "@/lib/duffel"
import { createFlightBookingAction } from "@/actions/db/flight-bookings-actions"
import { isValidPhoneNumber } from "libphonenumber-js"
import { features } from "@/config/features"
import { stripe } from "@/lib/stripe"
import { flightChargeTotal, flightServiceFee, toStripeMinorUnits } from "@/config/pricing"
import { db } from "@/db/db"
import { flightBookingsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Guard: the Duffel order below is paid from the platform's own balance, so
    // creating it without collecting customer payment is a direct financial loss.
    // Keep disabled until the Stripe charge flow lands (SPEC.md Phase D8).
    if (!features.flightsBookingEnabled) {
      return NextResponse.json(
        {
          error: "Flight booking is not yet available",
          message:
            "Online flight booking is coming soon. Please search flights and book with the airline directly for now."
        },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { offerId, passengers, raceId, paymentIntentId } = body

    // Validate request body
    if (!offerId || !passengers || !Array.isArray(passengers) || !raceId) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      )
    }

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json(
        { error: "Payment is required before booking" },
        { status: 402 }
      )
    }

    // Validate passengers
    const errors: string[] = []
    for (const passenger of passengers) {
      if (!passenger.title) errors.push("Title is required")
      if (!passenger.given_name) errors.push("First name is required")
      if (!passenger.family_name) errors.push("Last name is required")
      if (!passenger.email) errors.push("Email is required")
      if (!passenger.phone_number) {
        errors.push("Phone number is required")
      } else {
        try {
          // Validate phone number format
          if (!isValidPhoneNumber(passenger.phone_number)) {
            errors.push(
              "Invalid phone number format. Please include country code (e.g., +44)"
            )
          }
        } catch (error) {
          errors.push(
            "Invalid phone number format. Please include country code (e.g., +44)"
          )
        }
      }
      if (!passenger.born_on) errors.push("Date of birth is required")
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Missing or invalid fields", errors },
        { status: 400 }
      )
    }

    // Get the latest offer data
    const { data: offer } = await duffel.offers.get(offerId)

    // Authorise the Duffel order against the customer's payment. Everything here is
    // re-derived server-side: a client that lies about the PaymentIntent, reuses one, or
    // swaps in a cheaper offer must not be able to place an order.
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
    const expectedCharge = flightChargeTotal(offer.total_amount)
    const expectedMinorUnits = toStripeMinorUnits(
      expectedCharge,
      offer.total_currency
    )

    const paymentProblem =
      paymentIntent.status !== "succeeded"
        ? "Payment has not completed"
        : paymentIntent.metadata?.userId !== userId
          ? "Payment does not belong to this user"
          : paymentIntent.metadata?.offerId !== offerId
            ? "Payment does not match this offer"
            : paymentIntent.currency?.toUpperCase() !==
                offer.total_currency.toUpperCase()
              ? "Payment currency does not match the offer"
              : paymentIntent.amount_received < expectedMinorUnits
                ? "Payment amount does not cover the current offer price"
                : null

    if (paymentProblem) {
      console.error("[flights/book] payment rejected:", paymentProblem, {
        paymentIntentId,
        offerId
      })
      return NextResponse.json({ error: paymentProblem }, { status: 402 })
    }

    // A PaymentIntent may only ever back one booking (also enforced by a unique index).
    const alreadyUsed = await db
      .select({ id: flightBookingsTable.id })
      .from(flightBookingsTable)
      .where(eq(flightBookingsTable.paymentIntentId, paymentIntentId))
      .limit(1)
    if (alreadyUsed.length > 0) {
      return NextResponse.json(
        { error: "This payment has already been used for a booking" },
        { status: 409 }
      )
    }

    // Create the order with formatted phone numbers
    // The customer has already been charged. If the airline order fails from here on,
    // refund them rather than leaving money taken for a flight that was never booked.
    let order
    try {
      const created = await duffel.orders.create({
        type: "instant",
        selected_offers: [offerId],
        passengers: passengers.map(({ isPhoneValid, ...passenger }) => ({
          ...passenger,
          phone_number: passenger.phone_number
        })),
        payments: [
          {
            type: "balance",
            amount: offer.total_amount,
            currency: offer.total_currency
          }
        ]
      })
      order = created.data
    } catch (orderError) {
      console.error(
        "[flights/book] Duffel order failed after payment; refunding",
        { paymentIntentId, offerId },
        orderError
      )
      try {
        await stripe.refunds.create({
          payment_intent: paymentIntentId,
          reason: "requested_by_customer"
        })
      } catch (refundError) {
        // Surface loudly: the customer is out of pocket and needs a manual refund.
        console.error(
          "[flights/book] REFUND FAILED — manual intervention required",
          { paymentIntentId },
          refundError
        )
        return NextResponse.json(
          {
            error:
              "We couldn't complete your booking and the automatic refund failed. Our team has been alerted and will refund you — please contact support quoting your payment reference.",
            paymentIntentId
          },
          { status: 500 }
        )
      }
      return NextResponse.json(
        {
          error:
            "We couldn't complete your booking with the airline, so your payment has been refunded. Please try again."
        },
        { status: 502 }
      )
    }

    // Ensure IATA codes are available
    const departureIata = offer.slices[0].segments[0].origin.iata_code
    const arrivalIata = offer.slices[0].segments[0].destination.iata_code

    if (!departureIata || !arrivalIata) {
      throw new Error("Missing required IATA codes")
    }

    // Store the booking in the database
    const result = await createFlightBookingAction({
      userId,
      raceId,
      offerId,
      orderId: order.id,
      bookingReference: order.booking_reference,
      status: "confirmed",
      offerData: offer,
      passengerData: passengers.map(
        ({ isPhoneValid, ...passenger }) => passenger
      ),
      departureIata,
      arrivalIata,
      departureCity: offer.slices[0].segments[0].origin.city_name || null,
      arrivalCity: offer.slices[0].segments[0].destination.city_name || null,
      departureTime: new Date(offer.slices[0].segments[0].departing_at),
      arrivalTime: new Date(offer.slices[0].segments[0].arriving_at),
      totalAmount: offer.total_amount,
      totalCurrency: offer.total_currency,
      paymentIntentId,
      serviceFeeAmount: flightServiceFee(offer.total_amount),
      amountCharged: expectedCharge,
      expiresAt: new Date(offer.expires_at),
      completedAt: new Date()
    })

    if (!result.isSuccess || !result.data) {
      throw new Error("Failed to create booking record")
    }

    return NextResponse.json({
      success: true,
      message: "Flight booked successfully",
      data: {
        bookingId: result.data.id,
        bookingReference: order.booking_reference
      }
    })
  } catch (error: any) {
    console.error("Error booking flight:", error)

    // Handle Duffel API errors
    if (error.errors && Array.isArray(error.errors)) {
      return NextResponse.json(
        {
          error: "Failed to book flight",
          details: error.errors
            .map((e: any) => e.message || e.title)
            .join(", "),
          errors: error.errors
        },
        { status: 400 }
      )
    }

    // Handle other errors
    return NextResponse.json(
      {
        error: "Failed to book flight",
        details: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}
