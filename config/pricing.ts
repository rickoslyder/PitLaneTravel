/*
<ai_context>
Commercial terms for on-platform transactions. The flight service fee is what the
platform earns on a Duffel booking — Duffel orders are paid from the platform balance,
so the customer must be charged the offer total PLUS this fee before the order is created.
</ai_context>
*/

/** Percentage of the flight offer total taken as a service fee. */
const FLIGHT_SERVICE_FEE_PERCENT = Number(
  process.env.FLIGHT_SERVICE_FEE_PERCENT ?? "0"
)

/** Flat minimum service fee, in major currency units (e.g. 4.99). */
const FLIGHT_SERVICE_FEE_MINIMUM = Number(
  process.env.FLIGHT_SERVICE_FEE_MINIMUM ?? "0"
)

/**
 * Service fee for a flight offer, in the offer's currency, rounded to 2dp.
 * Returns "0.00" when no fee is configured, so the customer is charged exactly the
 * offer total.
 */
export function flightServiceFee(offerTotal: string | number): string {
  const total = typeof offerTotal === "string" ? Number(offerTotal) : offerTotal
  if (!Number.isFinite(total) || total <= 0) return "0.00"
  const pct = (total * FLIGHT_SERVICE_FEE_PERCENT) / 100
  return Math.max(pct, FLIGHT_SERVICE_FEE_MINIMUM).toFixed(2)
}

/** Offer total + service fee, in the offer's currency, rounded to 2dp. */
export function flightChargeTotal(offerTotal: string | number): string {
  const total = typeof offerTotal === "string" ? Number(offerTotal) : offerTotal
  return (total + Number(flightServiceFee(total))).toFixed(2)
}

/**
 * Stripe charges in the smallest currency unit. Zero-decimal currencies (JPY, KRW …)
 * must not be multiplied by 100.
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  "BIF", "CLP", "DJF", "GNF", "JPY", "KMF", "KRW", "MGA",
  "PYG", "RWF", "UGX", "VND", "VUV", "XAF", "XOF", "XPF"
])

export function toStripeMinorUnits(amount: string | number, currency: string): number {
  const value = typeof amount === "string" ? Number(amount) : amount
  if (ZERO_DECIMAL_CURRENCIES.has(currency.toUpperCase())) {
    return Math.round(value)
  }
  return Math.round(value * 100)
}
