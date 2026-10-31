import { describe, expect, it } from "vitest"
import {
  TICKET_BUY_LABEL,
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
  })

  it("still offers a waitlist for other non-sale states", () => {
    expect(ticketShowsWaitlist("pending")).toBe(true)
    expect(ticketAvailabilityLabel("low_stock")).toBe("Low Stock")
  })
})

describe("ticket empty state", () => {
  it("says tickets are not on sale yet for an upcoming race with none", () => {
    expect(ticketEmptyState("upcoming", "Abu Dhabi Grand Prix 2026")).toEqual({
      heading: "Not on sale yet",
      body: "Official tickets for Abu Dhabi Grand Prix 2026 are not on sale yet."
    })
  })

  it("does not call a past race with no links sold out", () => {
    const copy = ticketEmptyState("completed", "Australian Grand Prix 2026")
    expect(copy.heading).not.toBe("Not on sale yet")
    expect(copy.body).not.toMatch(/currently available/i)
    expect(copy.body).toMatch(/No official ticket links/)
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
})
