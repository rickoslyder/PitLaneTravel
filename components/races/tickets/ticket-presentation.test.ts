import { describe, expect, it } from "vitest"
import {
  NO_TICKET_LINKS_HEADING,
  RACE_TICKETS_CTA,
  TICKET_BUY_LABEL,
  raceDateIsBeforeToday,
  resellerHost,
  ticketAvailabilityLabel,
  ticketEmptyState,
  ticketSectionIntro,
  ticketShowsBuyButton,
  ticketShowsWaitlist
} from "./ticket-presentation"

describe("ticket availability states", () => {
  it("labels sold_out as Sold out and hides buy and waitlist", () => {
    expect(ticketAvailabilityLabel("sold_out")).toBe("Sold out")
    expect(ticketShowsBuyButton("sold_out")).toBe(false)
    expect(ticketShowsWaitlist("sold_out")).toBe(false)
  })

  it("keeps a buy link for available and limited stock", () => {
    expect(ticketShowsBuyButton("available")).toBe(true)
    expect(ticketShowsBuyButton("limited")).toBe(true)
    expect(ticketShowsWaitlist("available")).toBe(false)
    expect(ticketShowsWaitlist("limited")).toBe(false)
    expect(TICKET_BUY_LABEL).toBe("Buy from official seller")
    expect(RACE_TICKETS_CTA).toBe("Find tickets")
    expect(RACE_TICKETS_CTA).not.toMatch(/book|purchase/i)
  })

  it("still offers a waitlist for other non-sale states", () => {
    expect(ticketShowsWaitlist("pending")).toBe(true)
    expect(ticketAvailabilityLabel("low_stock")).toBe("Low Stock")
  })
})

describe("ticket empty state", () => {
  it("does not treat a missing link list as not on sale", () => {
    const copy = ticketEmptyState("Abu Dhabi Grand Prix 2026")
    expect(copy.heading).toBe(NO_TICKET_LINKS_HEADING)
    expect(copy.heading).not.toBe("Not on sale yet")
    expect(copy.body).toMatch(/Abu Dhabi Grand Prix 2026/)
    expect(copy.body).not.toMatch(/not on sale/i)
  })

  it("reserves Not on sale yet for the explicit availability value", () => {
    expect(ticketAvailabilityLabel("not_on_sale")).toBe("Not on sale yet")
    expect(ticketShowsBuyButton("not_on_sale")).toBe(false)
    expect(ticketShowsWaitlist("not_on_sale")).toBe(false)
  })
})

describe("past race dates", () => {
  const now = new Date("2026-10-31T18:00:00.000Z")

  it("hides buy and waitlist when the race date is before today", () => {
    expect(raceDateIsBeforeToday("2025-03-16T00:00:00.000Z", now)).toBe(true)
    expect(
      ticketShowsBuyButton("available", "2025-03-16T00:00:00.000Z", now)
    ).toBe(false)
    expect(
      ticketShowsWaitlist("pending", "2025-03-16T00:00:00.000Z", now)
    ).toBe(false)
  })

  it("keeps a buy link for a race later today or in the future", () => {
    expect(
      ticketShowsBuyButton("available", "2026-11-22T04:00:00.000Z", now)
    ).toBe(true)
    expect(
      ticketShowsBuyButton("available", "2026-10-31T04:00:00.000Z", now)
    ).toBe(true)
  })
})

describe("official seller copy", () => {
  it("does not claim we sell tickets or that every link covers the weekend", () => {
    const intro = ticketSectionIntro("São Paulo Grand Prix 2026")
    expect(intro).toMatch(/Official tickets/)
    expect(intro).toMatch(/does not sell tickets/)
    expect(intro).not.toMatch(/entire race weekend/i)
    expect(intro).not.toMatch(/our selection/i)
  })

  it("names the seller host for the external link", () => {
    expect(
      resellerHost("https://www.tickets.formula1.com/en/f1-3325-brazil")
    ).toBe("tickets.formula1.com")
    expect(resellerHost("not a url")).toBeNull()
  })

  it("does not claim every link is a direct organizer purchase when a seller is listed", () => {
    const intro = ticketSectionIntro("24 Hours of Le Mans 2026", true)
    expect(intro).toMatch(/ticket seller/)
    expect(intro).toMatch(/does not sell tickets/)
    expect(intro).not.toMatch(/buy directly from the series/i)
  })

  it("names the Partnerize destination instead of the tracking host", () => {
    expect(
      resellerHost(
        "https://p1travel.prf.hn/click/camref:abc/destination:https%3A%2F%2Fwww.p1travel.com%2Ff1"
      )
    ).toBe("p1travel.com")
    expect(resellerHost("https://p1travel.prf.hn/click/camref:abc")).toBeNull()
  })
})
