import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  OFFICIAL_SELLER_LINE,
  TicketsEmptyState,
  officialTicketStoreLabel
} from "./TicketsEmptyState"
import {
  EMPTY_TICKETS_BUTTON_HREF,
  EMPTY_TICKETS_BUTTON_LABEL,
  emptyTicketsMessage,
  hasTicketListings,
  plainOfficialTicketHref,
  ticketListingState
} from "./ticket-availability"

const RACE_NAME = "Abu Dhabi Grand Prix 2026"

describe("zero ticket listings", () => {
  it("uses the §28 empty-state sentence verbatim", () => {
    expect(emptyTicketsMessage(RACE_NAME)).toBe(
      "Tickets for Abu Dhabi Grand Prix 2026 aren't listed here yet. Check back soon, or see the other races coming up."
    )
    expect(emptyTicketsMessage(RACE_NAME)).not.toMatch(/on sale|available for/i)
  })

  it("treats missing tickets and packages as empty, including while a filter would be irrelevant", () => {
    expect(hasTicketListings(null)).toBe(false)
    expect(hasTicketListings({ tickets: [], packages: [] })).toBe(false)
    expect(hasTicketListings({ tickets: [{}], packages: [] })).toBe(true)
    expect(hasTicketListings({ tickets: [], packages: [{}] })).toBe(true)
    expect(ticketListingState(true, null)).toBe("unknown")
    expect(ticketListingState(false, { tickets: [], packages: [] })).toBe(
      "empty"
    )
    expect(ticketListingState(false, { tickets: [{}], packages: [] })).toBe(
      "listed"
    )
  })

  it("keeps a plain official ticket URL and drops redirect, affiliate, and circuit stand-ins", () => {
    expect(plainOfficialTicketHref(null)).toBeNull()
    expect(plainOfficialTicketHref("")).toBeNull()
    expect(
      plainOfficialTicketHref("https://tickets.example.com/abu-dhabi")
    ).toBe("https://tickets.example.com/abu-dhabi")
    expect(plainOfficialTicketHref("/api/redirect?to=1")).toBeNull()
    expect(
      plainOfficialTicketHref("https://pitlane.example/api/redirect?id=1")
    ).toBeNull()
    expect(plainOfficialTicketHref("javascript:alert(1)")).toBeNull()
  })

  it("renders the empty state with a calendar link and no affiliate or redirect", () => {
    const html = renderToStaticMarkup(
      createElement(TicketsEmptyState, { raceName: RACE_NAME })
    )

    expect(html.replace(/&#x27;/g, "'")).toContain(
      emptyTicketsMessage(RACE_NAME)
    )
    expect(html).toContain(EMPTY_TICKETS_BUTTON_LABEL)
    expect(html).toContain(`href="${EMPTY_TICKETS_BUTTON_HREF}"`)
    expect(html).not.toContain("/api/redirect")
    expect(html).not.toContain("sponsored")
    expect(html).not.toContain("Find tickets")
    expect(html).not.toContain("No tickets are currently available")
  })

  it("adds a plain official link only when race data already has one", () => {
    const without = renderToStaticMarkup(
      createElement(TicketsEmptyState, {
        raceName: RACE_NAME,
        officialTicketUrl: null
      })
    )
    expect(without.match(/<a /g)?.length ?? 0).toBe(1)

    const withOfficial = renderToStaticMarkup(
      createElement(TicketsEmptyState, {
        raceName: RACE_NAME,
        seriesName: "Formula 1",
        officialTicketUrl: "https://tickets.example.com/race"
      })
    )
    const text = withOfficial.replace(/&#x27;/g, "'")
    expect(text).toContain(emptyTicketsMessage(RACE_NAME))
    expect(text).toContain(EMPTY_TICKETS_BUTTON_LABEL)
    expect(text).toContain('href="https://tickets.example.com/race"')
    expect(text).toContain(officialTicketStoreLabel("Formula 1"))
    expect(text).toContain(OFFICIAL_SELLER_LINE)
    expect(text).not.toContain('rel="sponsored')
    expect(text).not.toContain("/api/redirect")
    expect(text).not.toContain("tickets.formula1.com")
  })
})
