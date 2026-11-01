/**
 * Zero-listing tickets tab (RACE-01).
 * Copy is §28 of the site-copy draft, verbatim.
 * There is no official ticket URL on a race. A circuit website is not a
 * ticket seller, so it is not linked from this empty state.
 */

export const EMPTY_TICKETS_BUTTON_LABEL = "See upcoming races"
export const EMPTY_TICKETS_BUTTON_HREF = "/races"
export const SEE_TRAVEL_OPTIONS_LABEL = "See travel options"

export type TicketListingState = "unknown" | "listed" | "empty"

export function emptyTicketsMessage(raceName: string): string {
  return `Tickets for ${raceName} aren't listed here yet. Check back soon, or see the other races coming up.`
}

export function hasTicketListings(
  data:
    | {
        tickets?: readonly unknown[] | null
        packages?: readonly unknown[] | null
      }
    | null
    | undefined
): boolean {
  return Boolean(data?.tickets?.length || data?.packages?.length)
}

export function ticketListingState(
  loading: boolean,
  data:
    | {
        tickets?: readonly unknown[] | null
        packages?: readonly unknown[] | null
      }
    | null
    | undefined
): TicketListingState {
  if (loading) return "unknown"
  return hasTicketListings(data) ? "listed" : "empty"
}

/**
 * Plain official ticket link, only when race data already has one.
 * Circuit websites and redirect/affiliate URLs are not official ticket links.
 */
export function plainOfficialTicketHref(
  url: string | null | undefined
): string | null {
  if (!url) return null
  const trimmed = url.trim()
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null
  if (parsed.pathname.includes("/api/redirect")) return null
  return parsed.toString()
}
