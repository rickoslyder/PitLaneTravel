import { describe, expect, it } from "vitest"
import {
  F1_OFFICIAL_TICKET_STORE,
  RACE_TICKETS_CTA,
  TICKET_BUY_LABEL,
  officialTicketCopyIsBareUnavailable,
  officialTicketFallback,
  raceDateIsBeforeToday,
  resellerHost,
  ticketAvailabilityLabel,
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

describe("ticket tab when nothing is listed", () => {
  it("sends an F1 race with no seller URL to the official F1 ticket store", () => {
    const fallback = officialTicketFallback({
      seriesSlug: "f1",
      seriesName: "Formula 1",
      storedSellerUrl: "https://www.yasmarinacircuit.com"
    })
    expect(fallback.href).toBe(F1_OFFICIAL_TICKET_STORE)
    expect(fallback.linkLabel).toBe("Official F1 ticket store")
    expect(fallback.disclosure).toMatch(/does not sell tickets/)
    expect(officialTicketCopyIsBareUnavailable(fallback.disclosure)).toBe(false)
    expect(fallback.disclosure).not.toMatch(/no tickets are currently available/i)
  })

  it("uses a stored ticket-seller URL for that F1 race", () => {
    const fallback = officialTicketFallback({
      seriesSlug: "f1",
      storedSellerUrl: "https://tickets.formula1.com/en/f1-abu-dhabi"
    })
    expect(fallback.href).toBe("https://tickets.formula1.com/en/f1-abu-dhabi")
    expect(fallback.linkLabel).toBe("Official F1 ticket store")
  })

  it("links a non-F1 series site only when the data has one", () => {
    const listed = officialTicketFallback({
      seriesSlug: "wec",
      seriesName: "World Endurance Championship",
      storedSellerUrl: "https://www.24h-lemans.com/en/tickets"
    })
    expect(listed.href).toBe("https://www.24h-lemans.com/en/tickets")
    expect(listed.linkLabel).toMatch(/World Endurance Championship/)

    const missing = officialTicketFallback({
      seriesSlug: "formula-e",
      seriesName: "Formula E"
    })
    expect(missing.href).toBeNull()
    expect(missing.linkLabel).toBeNull()
    expect(missing.disclosure).toMatch(/Formula E/)
    expect(missing.disclosure).toMatch(/does not sell tickets/)
    expect(missing.disclosure).not.toMatch(/no tickets are currently available/i)
    expect(missing.disclosure).not.toContain(F1_OFFICIAL_TICKET_STORE)
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
    expect(resellerHost("https://p1travel.prf.hn/click/camref:abc")).toBe(
      "p1travel.com"
    )
  })
})
