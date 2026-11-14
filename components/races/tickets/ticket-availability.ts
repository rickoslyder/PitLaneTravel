/**
 * Zero-listing tickets tab (RACE-01).
 * The sentence under the empty hero is the tickets-tab copy as well.
 * There is no official ticket URL on a race. A circuit website is not a
 * ticket seller, so it is not linked from this empty state.
 */

import { TICKETS_NOT_LISTED_NOTE } from "./ticket-presentation"

export const EMPTY_TICKETS_BUTTON_LABEL = "See upcoming races"
export const EMPTY_TICKETS_BUTTON_HREF = "/races"

export type TicketListingState = "unknown" | "listed" | "empty"

export function emptyTicketsMessage(_raceName: string): string {
  return TICKETS_NOT_LISTED_NOTE
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
