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
   * Recurring subscriptions stay off until a genuinely gated repeated-use
   * product exists (Day-70). Literal false — not env-toggleable.
   */
  subscriptionsEnabled: false
} as const
