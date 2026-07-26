"use server"

import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { duffel } from "@/lib/duffel"
import {
  findBookingByPaymentIntent,
  reclaimStaleReservation,
  updateFlightBookingById
} from "@/db/queries/flight-bookings"
import { isValidPhoneNumber } from "libphonenumber-js"
import { features } from "@/config/features"
import { stripe } from "@/lib/stripe"
import {
  flightChargeTotal,
  flightServiceFee,
  isSupportedCurrency,
  toStripeMinorUnits
} from "@/config/pricing"
import { db } from "@/db/db"
import { flightBookingsTable } from "@/db/schema"
import { eq } from "drizzle-orm"

/** Postgres unique-violation code. */
function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  )
}

/**
 * Refund a PaymentIntent, tolerating the retry case. Returns true when the customer
 * ends up refunded (including when they already were), false when manual intervention
 * is needed. An idempotency key makes a retried request safe.
 */
async function refundPaymentIntent(paymentIntentId: string): Promise<boolean> {
  try {
    await stripe.refunds.create(
      { payment_intent: paymentIntentId, reason: "requested_by_customer" },
      { idempotencyKey: `refund_${paymentIntentId}` }
    )
    return true
  } catch (error) {
    // Stripe rejects a second full refund; that means the customer already has
    // their money back, which is the outcome we want.
    const err = error as { code?: string; type?: string }
    if (err?.code === "charge_already_refunded") return true
    // Two requests refunding the same intent share our idempotency key; the loser gets
    // an idempotency error even though the refund itself succeeded.
    if (err?.type === "idempotency_error" || err?.code === "idempotency_key_in_use") {
      return true
    }
    try {
      const existing = await stripe.refunds.list({
        payment_intent: paymentIntentId,
        limit: 1
      })
      if (existing.data.some(r => r.status === "succeeded" || r.status === "pending")) {
        return true
      }
    } catch {
      // fall through to the failure path below
    }
    console.error(
      "[flights/book] REFUND FAILED — manual intervention required",
      { paymentIntentId },
      error
    )
    return false
  }
}

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
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 })
    }
    if (!isSupportedCurrency(offer.total_currency)) {
      return NextResponse.json(
        {
          error: `We can't process payments in ${offer.total_currency} yet. Please search again in a supported currency.`
        },
        { status: 400 }
      )
    }

    // Authorise the Duffel order against the customer's payment. Everything here is
    // re-derived server-side: a client that lies about the PaymentIntent, reuses one, or
    // swaps in a cheaper offer must not be able to place an order.
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ["latest_charge"]
    })
    // A fully refunded PaymentIntent KEEPS status "succeeded" in Stripe, so status alone
    // would let an already-refunded payment buy a flight.
    const latestCharge = paymentIntent.latest_charge as
      | { refunded?: boolean; amount_refunded?: number }
      | null
    const isRefunded =
      Boolean(latestCharge?.refunded) || (latestCharge?.amount_refunded ?? 0) > 0
    const expectedCharge = flightChargeTotal(offer.total_amount)
    const expectedMinorUnits = toStripeMinorUnits(
      expectedCharge,
      offer.total_currency
    )

    const paymentProblem =
      paymentIntent.status !== "succeeded"
        ? "Payment has not completed"
        : isRefunded
          ? "This payment has already been refunded"
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

    // NEVER refund a PaymentIntent that is already attached to a booking. Replaying a
    // used PaymentIntent against a different offer trips the mismatch checks below, and
    // refunding there would claw back the money for a flight that was actually ticketed.
    const existingBooking = await findBookingByPaymentIntent(paymentIntentId)
    const refundIfUnused = async () =>
      existingBooking ? false : await refundPaymentIntent(paymentIntentId)

    if (existingBooking && existingBooking.status !== "pending") {
      return NextResponse.json(
        { error: "This payment has already been used for a booking" },
        { status: 409 }
      )
    }

    if (paymentProblem) {
      console.error("[flights/book] payment rejected:", paymentProblem, {
        paymentIntentId,
        offerId
      })
      // The card is already charged by the time these checks can fail, so give the
      // money back — unless it is backing an existing booking (guarded above).
      const refunded =
        paymentIntent.status === "succeeded" ? await refundIfUnused() : true
      return NextResponse.json(
        {
          error: refunded
            ? `${paymentProblem}. Your payment has been refunded.`
            : `${paymentProblem}. Please contact support quoting ${paymentIntentId}.`
        },
        { status: 402 }
      )
    }

    // The offer must still be live: ordering an expired offer fails at Duffel, and by
    // then the customer has been charged and needs a refund cycle they never needed.
    if (new Date(offer.expires_at) <= new Date()) {
      const refunded = await refundIfUnused()
      return NextResponse.json(
        {
          error: refunded
            ? "This fare expired before the booking completed, so your payment has been refunded. Please search again."
            : `This fare expired — please contact support quoting ${paymentIntentId}.`
        },
        { status: 409 }
      )
    }

    // Reserve the PaymentIntent by writing a `pending` booking BEFORE calling Duffel.
    // The unique index on payment_intent_id makes this the concurrency guard: a second
    // in-flight request for the same payment loses here, so it can never reach Duffel
    // and can never refund the payment that backs the winner's confirmed order.
    let bookingId: string
    try {
      const [reserved] = await db
        .insert(flightBookingsTable)
        .values({
          userId,
          raceId,
          offerId,
          status: "pending",
          paymentIntentId,
          serviceFeeAmount: flightServiceFee(offer.total_amount),
          amountCharged: expectedCharge,
          totalAmount: offer.total_amount,
          totalCurrency: offer.total_currency,
          departureIata: offer.slices[0].segments[0].origin.iata_code ?? "",
          arrivalIata: offer.slices[0].segments[0].destination.iata_code ?? "",
          departureTime: new Date(offer.slices[0].segments[0].departing_at),
          arrivalTime: new Date(offer.slices[0].segments[0].arriving_at),
          offerData: offer,
          passengerData: passengers.map(
            ({ isPhoneValid, ...passenger }: any) => passenger
          ),
          expiresAt: new Date(offer.expires_at)
        })
        .returning({ id: flightBookingsTable.id })
      bookingId = reserved.id
    } catch (reserveError) {
      // Unique violation => this payment is already reserved or used by another request.
      if (isUniqueViolation(reserveError)) {
        // A request killed between reserving and ordering (function timeout, deploy)
        // leaves a `pending` row holding the payment. Without this, the customer is
        // charged and every retry 409s forever. Take over an abandoned reservation.
        const reclaimed = await reclaimStaleReservation(paymentIntentId)
        if (reclaimed) {
          console.warn("[flights/book] reclaimed stale reservation", {
            paymentIntentId,
            bookingId: reclaimed
          })
          bookingId = reclaimed
        } else {
          return NextResponse.json(
            {
              error:
                "This payment is already being used for a booking. If you think this is wrong, wait a moment and try again, or contact support.",
              paymentIntentId
            },
            { status: 409 }
          )
        }
      } else {
        // Anything else (e.g. a malformed raceId) fails before any airline order exists,
        // so the customer can be refunded cleanly.
        console.error("[flights/book] could not reserve booking:", reserveError)
        const refunded = await refundIfUnused()
        return NextResponse.json(
          {
            error: refunded
              ? "We couldn't start your booking, so your payment has been refunded."
              : `We couldn't start your booking — please contact support quoting ${paymentIntentId}.`
          },
          { status: refunded ? 400 : 500 }
        )
      }
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
        ],
        // Stamp our identifiers onto the airline order so reconciliation can prove an
        // order exists for a given payment. Without this the sweep cannot distinguish
        // "order never created" from "order created, we never recorded it" — and would
        // refund a real ticket. Duffel exposes metadata on the Order it returns.
        metadata: {
          payment_intent_id: paymentIntentId,
          booking_id: bookingId
        }
      })
      order = created.data
    } catch (orderError) {
      console.error(
        "[flights/book] Duffel order failed after payment; refunding",
        { paymentIntentId, offerId, bookingId },
        orderError
      )
      const refunded = await refundPaymentIntent(paymentIntentId)
      await db
        .update(flightBookingsTable)
        .set({ status: "failed" })
        .where(eq(flightBookingsTable.id, bookingId))

      if (!refunded) {
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

    // From here the airline order EXISTS and the customer has been charged. Never throw:
    // any failure now must still persist the order reference, or we lose the only record
    // of a real ticket the customer paid for.
    const confirmed = await updateFlightBookingById(bookingId, {
      orderId: order.id,
      bookingReference: order.booking_reference,
      status: "confirmed",
      departureIata: offer.slices[0].segments[0].origin.iata_code || "UNKNOWN",
      arrivalIata:
        offer.slices[0].segments[0].destination.iata_code || "UNKNOWN",
      departureCity: offer.slices[0].segments[0].origin.city_name || null,
      arrivalCity: offer.slices[0].segments[0].destination.city_name || null,
      completedAt: new Date()
    })

    if (!confirmed) {
      // The ticket is issued; surface the reference so the customer is not stranded.
      console.error(
        "[flights/book] ORDER CREATED BUT RECORD UPDATE FAILED — manual reconciliation required",
        { bookingId, orderId: order.id, bookingReference: order.booking_reference }
      )
      return NextResponse.json({
        success: true,
        warning:
          "Your flight is booked, but we had trouble saving it to your account. Please keep your booking reference.",
        bookingReference: order.booking_reference,
        orderId: order.id
      })
    }

    return NextResponse.json({
      success: true,
      message: "Flight booked successfully",
      data: {
        bookingId: confirmed.id,
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
