/*
<ai_context>
Commercial terms for on-platform transactions. The flight service fee is what the
platform earns on a Duffel booking — Duffel orders are paid from the platform balance,
so the customer must be charged the offer total PLUS this fee before the order is created.
</ai_context>
*/

/** Percentage of the flight offer total taken as a service fee. */
function numericEnv(name: string): number {
  const raw = process.env[name]
  if (raw === undefined || raw === "") return 0
  const value = Number(raw)
  if (!Number.isFinite(value) || value < 0) {
    // Fail loudly at load: a malformed fee would otherwise become NaN and 500 every
    // payment request with no hint as to which variable is wrong.
    throw new Error(
      `${name} must be a non-negative number, got ${JSON.stringify(raw)}`
    )
  }
  return value
}

const FLIGHT_SERVICE_FEE_PERCENT = numericEnv("FLIGHT_SERVICE_FEE_PERCENT")

/** Flat minimum service fee, in major currency units (e.g. 4.99). */
/**
 * Flat minimum fee. NOTE: this is currency-blind — it is applied as-is whatever the
 * offer currency is, so a value tuned for GBP is meaningless against JPY. Prefer setting
 * only FLIGHT_SERVICE_FEE_PERCENT unless you charge in a single currency.
 */
const FLIGHT_SERVICE_FEE_MINIMUM = numericEnv("FLIGHT_SERVICE_FEE_MINIMUM")

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

/** Stripe expresses these in 1/1000 units, not 1/100. Multiplying by 100 undercharges 10x. */
const THREE_DECIMAL_CURRENCIES = new Set(["BHD", "JOD", "KWD", "OMR", "TND"])

/**
 * Currencies we are willing to charge in. Anything outside this list is refused rather
 * than guessed at, because getting the minor-unit exponent wrong mischarges the customer.
 */
export const CHARGEABLE_CURRENCIES = new Set([
  "USD", "EUR", "GBP", "AUD", "CAD", "CHF", "SEK", "NOK", "DKK",
  "NZD", "SGD", "HKD", "AED", "JPY"
])

export function isSupportedCurrency(currency: string): boolean {
  return CHARGEABLE_CURRENCIES.has(currency.toUpperCase())
}

export function toStripeMinorUnits(amount: string | number, currency: string): number {
  const value = typeof amount === "string" ? Number(amount) : amount
  const code = currency.toUpperCase()
  if (ZERO_DECIMAL_CURRENCIES.has(code)) return Math.round(value)
  if (THREE_DECIMAL_CURRENCIES.has(code)) return Math.round(value * 1000)
  return Math.round(value * 100)
}
