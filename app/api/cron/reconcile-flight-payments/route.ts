import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { verifyCronRequest } from "@/lib/cron"
import {
  findAbandonedReservations,
  updateFlightBookingById
} from "@/db/queries/flight-bookings"

export const dynamic = "force-dynamic"
export const maxDuration = 60

/**
 * Refund customers whose payment was taken but whose booking never completed.
 *
 * The charge and the Duffel order are not one transaction: if the function dies between
 * reserving the PaymentIntent and creating the airline order, the booking route's own
 * refund path never runs. That leaves money taken with nothing delivered, and no code
 * path recovers it. This sweep is that recovery.
 *
 * Safety properties:
 * - Only touches `pending` rows with NO orderId, so a real airline order is never refunded.
 * - Re-reads Stripe as the source of truth rather than trusting our own row.
 * - Uses an idempotency key, and treats an already-refunded charge as success, so
 *   repeated runs cannot double-refund.
 */
export async function GET(req: Request) {
  const denied = verifyCronRequest(req)
  if (denied) return denied

  const results = { checked: 0, refunded: 0, alreadySettled: 0, failed: 0 }

  try {
    const abandoned = await findAbandonedReservations()
    results.checked = abandoned.length

    for (const booking of abandoned) {
      const paymentIntentId = booking.paymentIntentId
      if (!paymentIntentId) continue

      try {
        const intent = await stripe.paymentIntents.retrieve(paymentIntentId)

        // Never charged (abandoned checkout): just close the reservation out so it
        // stops holding the PaymentIntent.
        if (intent.status !== "succeeded") {
          await updateFlightBookingById(booking.id, { status: "expired" })
          results.alreadySettled++
          continue
        }

        await stripe.refunds.create(
          { payment_intent: paymentIntentId, reason: "requested_by_customer" },
          { idempotencyKey: `refund_${paymentIntentId}` }
        )
        await updateFlightBookingById(booking.id, { status: "failed" })
        results.refunded++
        console.warn("[reconcile-flight-payments] refunded abandoned booking", {
          bookingId: booking.id,
          paymentIntentId
        })
      } catch (error) {
        const code = (error as { code?: string; type?: string })?.code
        const type = (error as { type?: string })?.type
        // Already refunded, or a concurrent refund holds the idempotency key: the
        // customer has their money, which is the outcome we want.
        if (
          code === "charge_already_refunded" ||
          type === "idempotency_error" ||
          code === "idempotency_key_in_use"
        ) {
          await updateFlightBookingById(booking.id, { status: "failed" })
          results.alreadySettled++
          continue
        }
        results.failed++
        console.error(
          "[reconcile-flight-payments] REFUND FAILED — manual intervention required",
          { bookingId: booking.id, paymentIntentId },
          error
        )
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (error) {
    console.error("[reconcile-flight-payments] sweep failed:", error)
    return NextResponse.json(
      { success: false, error: "Reconciliation failed", ...results },
      { status: 500 }
    )
  }
}
