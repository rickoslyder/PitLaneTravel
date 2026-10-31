/*
<ai_context>
Central feature flags. Read from env at import time so they can be toggled per
environment without code changes. Keep flags boolean and default-safe (off).
</ai_context>
*/

function flag(name: string, defaultValue = false): boolean {
  const raw = process.env[name]
  if (raw === undefined) return defaultValue
  return raw === "1" || raw.toLowerCase() === "true"
}

export const features = {
  /**
   * When off, flight *booking* is disabled. It must stay off until customer payment
   * is collected (Stripe PaymentIntent) — otherwise Duffel orders are paid from the
   * platform's own Duffel balance. See SPEC.md Phase D8.
   */
  flightsBookingEnabled: flag("FLIGHTS_BOOKING_ENABLED", false),
  /** Gate heavier AI planner usage behind Pro membership. */
  aiPlannerProGate: flag("AI_PLANNER_PRO_GATE", false),
  /**
   * Stored P1 Travel / Partnerize ticket rows stay hidden until a hosting
   * decision says they can be shown (issue #39). Official untagged links
   * are not gated. Unset, empty, and any value other than 1/true stay off.
   */
  affiliateTicketsEnabled: flag("AFFILIATE_TICKETS_ENABLED", false),
  /**
   * Recurring subscriptions stay off until a genuinely gated repeated-use
   * product exists. Literal false — not env-toggleable.
   */
  subscriptionsEnabled: false
} as const
