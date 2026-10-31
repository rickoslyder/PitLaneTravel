/**
 * How the public tickets tab describes links to someone else's shop.
 * Pit Lane does not sell tickets and does not track another seller's stock.
 */

export const TICKET_BUY_LABEL = "Buy from official seller"

export function ticketSectionIntro(raceName: string): string {
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
    default:
      return availability
        .split("_")
        .filter(Boolean)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
  }
}

/** Buy links stay up for available and limited stock. Sold out has no button. */
export function ticketShowsBuyButton(availability: string): boolean {
  return availability === "available" || availability === "limited"
}

/** Waitlist signup is only for states we might restock ourselves. */
export function ticketShowsWaitlist(availability: string): boolean {
  return !ticketShowsBuyButton(availability) && availability !== "sold_out"
}

export function ticketEmptyState(
  status: string,
  raceName: string
): { heading: string; body: string } {
  if (status === "upcoming") {
    return {
      heading: "Not on sale yet",
      body: `Official tickets for ${raceName} are not on sale yet.`
    }
  }
  return {
    heading: "Official tickets",
    body: `No official ticket links for ${raceName} yet.`
  }
}

export function resellerHost(url: string): string | null {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return null
  }
}
