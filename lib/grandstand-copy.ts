/**
 * Public labels for grandstand cards. Stored notes often already start with
 * "Best" or "Best for", and sun/price values are stored as short codes.
 */

const LEADING_BEST = /^(?:best\s+for|best)(?=\s|$)/i

const SUN_EXPOSURE_LABEL: Record<string, string> = {
  shaded: "Shaded",
  "shaded sun": "Shaded",
  full: "Full sun",
  "full sun": "Full sun",
  morning: "Morning sun",
  "morning sun": "Morning sun",
  afternoon: "Afternoon sun",
  "afternoon sun": "Afternoon sun"
}

const PRICE_TIER_LABEL: Record<string, string> = {
  budget: "Budget",
  mid: "Mid-range",
  premium: "Premium"
}

export const GRANDSTAND_PRICE_LEGEND =
  "Budget, Mid-range and Premium compare grandstands at the same circuit. They are relative bands, not ticket prices."

function sentenceRemainder(remainder: string): string {
  const [first = "", ...rest] = remainder.split(" ")
  const word =
    first === first.toUpperCase()
      ? first.toLowerCase()
      : first.charAt(0).toLowerCase() + first.slice(1)
  return [word, ...rest].join(" ")
}

/** One "Best for" prefix, with the note's own leading "Best" / "Best for" removed. */
export function formatBestFor(value: string | null | undefined): string {
  let remainder = (value ?? "").trim().replace(/\s+/g, " ")
  while (LEADING_BEST.test(remainder)) {
    remainder = remainder.replace(LEADING_BEST, "").trim()
  }
  if (!remainder) return ""
  return `Best for ${sentenceRemainder(remainder)}`
}

/** Readable sun label. "shaded" stays "Shaded"; "full" becomes "Full sun". */
export function formatSunExposure(value: string | null | undefined): string {
  const key = (value ?? "").trim().toLowerCase().replace(/\s+/g, " ")
  if (!key) return ""
  return SUN_EXPOSURE_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

/**
 * Relative price band. Stored rows have no typical price, and the currency
 * column is a default rather than the circuit's currency, so this never
 * prints a symbol or an amount.
 */
export function formatPriceTier(value: string | null | undefined): string {
  const key = (value ?? "").trim().toLowerCase()
  if (!key) return ""
  return PRICE_TIER_LABEL[key] ?? key.charAt(0).toUpperCase() + key.slice(1)
}

export function grandstandComparedPhrase(count: number): string {
  return count === 1 ? "grandstand compared" : "grandstands compared"
}
