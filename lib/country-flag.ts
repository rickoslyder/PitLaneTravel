/**
 * Unicode flag for a country name already stored on a race or circuit.
 * Unknown names return null so the card does not invent a mark.
 */

const ISO_BY_COUNTRY: Record<string, string> = {
  australia: "AU",
  austria: "AT",
  azerbaijan: "AZ",
  bahrain: "BH",
  belgium: "BE",
  brazil: "BR",
  canada: "CA",
  china: "CN",
  czechia: "CZ",
  "czech republic": "CZ",
  england: "GB",
  france: "FR",
  germany: "DE",
  "great britain": "GB",
  hungary: "HU",
  indonesia: "ID",
  italy: "IT",
  japan: "JP",
  malaysia: "MY",
  mexico: "MX",
  monaco: "MC",
  netherlands: "NL",
  portugal: "PT",
  qatar: "QA",
  "saudi arabia": "SA",
  singapore: "SG",
  spain: "ES",
  thailand: "TH",
  "the netherlands": "NL",
  uae: "AE",
  uk: "GB",
  "united arab emirates": "AE",
  "united kingdom": "GB",
  "united states": "US",
  "united states of america": "US",
  usa: "US"
}

export function countryFlagEmoji(
  country: string | null | undefined
): string | null {
  if (!country) return null
  const iso = ISO_BY_COUNTRY[country.trim().toLowerCase().replace(/\./g, "")]
  if (!iso || !/^[A-Z]{2}$/.test(iso)) return null
  return String.fromCodePoint(
    ...[...iso].map(char => 127397 + char.charCodeAt(0))
  )
}
