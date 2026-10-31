/**
 * Detect stored ticket affiliate links. The 2025 catalogue is P1 Travel
 * through Partnerize (p1travel.com, *.prf.hn, camref). Official seller URLs
 * without those markers are not affiliate links.
 */

const P1_HOST = "p1travel.com"

export function affiliatePartnerFromUrl(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const host = parsed.hostname.toLowerCase().replace(/^www\./, "")
  const params = parsed.searchParams
  const partnerize =
    host === "prf.hn" ||
    host.endsWith(".prf.hn") ||
    host === "partnerize.com" ||
    host.endsWith(".partnerize.com") ||
    params.has("camref") ||
    params.has("pubref")
  const p1 = host === P1_HOST || host.endsWith(`.${P1_HOST}`)

  if (p1) return "P1 Travel"
  if (partnerize) return "P1 Travel"
  return null
}

export function isAffiliateTicketUrl(url: string): boolean {
  return affiliatePartnerFromUrl(url) !== null
}

export function affiliatePartnersOnPage(
  tickets: readonly { resellerUrl: string }[]
): string[] {
  const names = new Set<string>()
  for (const ticket of tickets) {
    const partner = affiliatePartnerFromUrl(ticket.resellerUrl)
    if (partner) names.add(partner)
  }
  return [...names]
}

