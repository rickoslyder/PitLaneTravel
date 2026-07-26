import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { duffel } from "@/lib/duffel"
import { verifyCronRequest } from "@/lib/cron"
import {
  findAbandonedReservations,
  updateFlightBookingById
} from "@/db/queries/flight-bookings"


/**
 * Ask Duffel whether an order already exists for this offer.
 *
 * Returns the order when one exists, `null` when Duffel positively reports none, and
 * "unknown" when we could not determine it. The caller MUST NOT refund on "unknown":
 * refunding a ticket that actually exists gives away a flight the platform has paid for.
 */
async function findDuffelOrderForOffer(
  offerId: string
): Promise<{ id: string; booking_reference?: string | null } | null | "unknown"> {
  try {
    const { data: orders } = await duffel.orders.list({ limit: 200 })
    const match = (orders ?? []).find((o: any) =>
      (o.offer_id && o.offer_id === offerId) ||
      (Array.isArray(o.selected_offers) && o.selected_offers.includes(offerId))
    )
    return match
      ? { id: match.id, booking_reference: (match as any).booking_reference ?? null }
      : null
  } catch (error) {
    console.error("[reconcile-flight-payments] Duffel order lookup failed", error)
    return "unknown"
  }
}

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
 * - A refund requires POSITIVE confirmation from Duffel that no order exists. Our own
 *   row is not evidence: the very crash this sweep handles (dying between
 *   duffel.orders.create() and writing orderId) leaves a real ticket with no orderId.
 * - If Duffel cannot be reached, it refunds NOTHING and flags for manual review.
 * - A ticket found at Duffel is repaired into a confirmed booking, never refunded.
 * - Re-reads Stripe as the source of truth rather than trusting our own row.
 * - Idempotency key + "already refunded" treated as success, so repeated runs cannot
 *   double-refund.
 */
export async function GET(req: Request) {
  const denied = verifyCronRequest(req)
  if (denied) return denied

  const results = {
    checked: 0,
    refunded: 0,
    repaired: 0,
    alreadySettled: 0,
    needsReview: 0,
    failed: 0
  }

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

        // CRITICAL: a missing orderId in our row does NOT mean no ticket exists. The
        // exact crash this sweep exists for — dying between duffel.orders.create() and
        // writing orderId — leaves a real, paid-for ticket with no orderId recorded.
        // Refunding on our own row alone would hand out free flights. Ask Duffel.
        const existingOrder = await findDuffelOrderForOffer(booking.offerId)

        if (existingOrder === "unknown") {
          // Could not confirm either way: never refund on incomplete information.
          results.needsReview++
          console.error(
            "[reconcile-flight-payments] cannot confirm Duffel order state — SKIPPING refund, needs manual review",
            { bookingId: booking.id, paymentIntentId, offerId: booking.offerId }
          )
          continue
        }

        if (existingOrder) {
          // The ticket is real: repair the record instead of refunding it.
          await updateFlightBookingById(booking.id, {
            status: "confirmed",
            orderId: existingOrder.id,
            bookingReference: existingOrder.booking_reference ?? null,
            completedAt: new Date()
          })
          results.repaired++
          console.warn(
            "[reconcile-flight-payments] recovered a ticketed order whose record was never written",
            { bookingId: booking.id, orderId: existingOrder.id }
          )
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
