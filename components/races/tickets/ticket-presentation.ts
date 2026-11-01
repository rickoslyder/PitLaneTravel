/**
 * How the public tickets tab describes links to someone else's shop.
 * Pit Lane does not sell tickets and does not track another seller's stock.
 */

export const TICKET_BUY_LABEL = "Buy from official seller"

/** Race-page button that scrolls to the tickets tab. PitLane does not book the race. */
export const RACE_TICKETS_CTA = "Find tickets"

export const NO_TICKET_LINKS_HEADING = "No official ticket links listed yet"

/** Explicit ticket.availability value. Missing rows are not this state. */
export const NOT_ON_SALE_AVAILABILITY = "not_on_sale"

export function ticketSectionIntro(
  raceName: string,
  includesAffiliate = false
): string {
  if (includesAffiliate) {
    return `Tickets for ${raceName}. Some links open the series, promoter or circuit. Others open a ticket seller. Pit Lane does not sell tickets.`
  }
  return `Official tickets for ${raceName}. You buy directly from the series, promoter or circuit. Pit Lane does not sell tickets.`
}

export function ticketAvailabilityLabel(availability: string): string {
  switch (availability) {
    case "available":
      return "Available"
    case "limited":
      return "Limited"
    case "sold_out":
      return "Sold out"
    case "not_on_sale":
      return "Not on sale yet"
    default:
      return availability
        .split("_")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
  }
}

/** True when the stored race instant falls before 00:00Z of `now`'s UTC day. */
export function raceDateIsBeforeToday(
  raceDate: string | Date,
  now: Date
): boolean {
  const instant = new Date(raceDate).getTime()
  if (Number.isNaN(instant)) return false
  const startOfTodayUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  )
  return instant < startOfTodayUtc
}

/**
 * Buy links stay up for available and limited stock on a race that has not
 * passed. A past race date and an explicit not_on_sale row have no button.
 */
export function ticketShowsBuyButton(
  availability: string,
  raceDate?: string | Date | null,
  now: Date = new Date()
): boolean {
  if (availability === NOT_ON_SALE_AVAILABILITY) return false
  if (raceDate && raceDateIsBeforeToday(raceDate, now)) return false
  return availability === "available" || availability === "limited"
}

/** Waitlist signup is only for states we might restock ourselves. */
export function ticketShowsWaitlist(
  availability: string,
  raceDate?: string | Date | null,
  now: Date = new Date()
): boolean {
  if (raceDate && raceDateIsBeforeToday(raceDate, now)) return false
  return (
    !ticketShowsBuyButton(availability, raceDate, now) &&
    availability !== "sold_out" &&
    availability !== NOT_ON_SALE_AVAILABILITY
  )
}

export function ticketEmptyState(raceName: string): {
  heading: string
  body: string
} {
  return {
    heading: NO_TICKET_LINKS_HEADING,
    body: `No official ticket links for ${raceName} are listed yet.`
  }
}

const TRACKING_HOST = /(^|\.)prf\.hn$|(^|\.)partnerize\.com$/i

function bareHost(url: URL): string {
  return url.hostname.replace(/^www\./, "")
}

function httpUrl(value: string | null | undefined): URL | null {
  if (!value) return null
  let decoded = value
  try {
    decoded = decodeURIComponent(value)
    if (decoded.includes("%")) decoded = decodeURIComponent(decoded)
  } catch {
    decoded = value
  }
  try {
    const url = new URL(decoded)
    if (url.protocol !== "http:" && url.protocol !== "https:") return null
    return url
  } catch {
    return null
  }
}

/** Partnerize click URLs store the merchant in a `destination:` path segment. */
function partnerizeDestination(page: URL): URL | null {
  const fromQuery = httpUrl(page.searchParams.get("destination"))
  if (fromQuery) return fromQuery

  const marker = "destination:"
  const index = page.pathname.toLowerCase().indexOf(marker)
  if (index === -1) return null
  const raw = page.pathname.slice(index + marker.length).split("/")[0]
  return httpUrl(raw)
}

export function resellerHost(url: string): string | null {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }

  const destination = partnerizeDestination(parsed)
  if (destination) return bareHost(destination)

  const host = bareHost(parsed)
  if (host === "p1travel.prf.hn") return "p1travel.com"
  if (TRACKING_HOST.test(host)) return null
  return host
}
