import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { duffel } from "@/lib/duffel"
import { verifyCronRequest } from "@/lib/cron"
import {
  findAbandonedReservations,
  updateFlightBookingById
} from "@/db/queries/flight-bookings"


/**
 * Ask Duffel whether an order already exists for this payment.
 *
 * Returns the order when one is found, `null` when none was found in the recent window,
 * and "unknown" when Duffel could not be reached. The caller MUST NOT refund on
 * "unknown" — refunding a ticket that exists gives away a flight the platform paid for.
 *
 * CAVEAT: `null` means "not found in the last 200 orders", not a proof of absence. An
 * order older than that window would be missed. This is why automatic refunding is
 * opt-in below rather than the default.
 */
async function findDuffelOrderForPayment(
  paymentIntentId: string
): Promise<{ id: string; booking_reference?: string | null } | null | "unknown"> {
  try {
    // Duffel's list API cannot filter by offer or metadata (ListParamsOrders supports
    // only awaiting_payment / passenger_name / booking_reference), so page recent orders
    // and match the metadata we stamped on at create time.
    const { data: orders } = await duffel.orders.list({ limit: 200 })
    const match = (orders ?? []).find(
      o => o.metadata?.payment_intent_id === paymentIntentId
    )
    return match
      ? { id: match.id, booking_reference: match.booking_reference ?? null }
      : null
  } catch (error) {
    console.error("[reconcile-flight-payments] Duffel order lookup failed", error)
    return "unknown"
  }
}

/**
 * Automatic refunds are OPT-IN. Reconciliation moves money with no human in the loop, and
 * every previous iteration of this logic shipped a bug that refunded real tickets. Until
 * the flow has been validated end-to-end in Stripe test mode, the sweep only REPORTS.
 */
const autoRefundEnabled =
  process.env.RECONCILE_AUTO_REFUND === "1" ||
  process.env.RECONCILE_AUTO_REFUND?.toLowerCase() === "true"

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
        const existingOrder = await findDuffelOrderForPayment(paymentIntentId)

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

        if (!autoRefundEnabled) {
          results.needsReview++
          console.warn(
            "[reconcile-flight-payments] refund needed but auto-refund is disabled — review manually",
            { bookingId: booking.id, paymentIntentId }
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
