import { describe, it, expect } from "vitest"
import { estimateBudget } from "./budget"

describe("estimateBudget", () => {
  it("computes a solo grandstand weekend", () => {
    const b = estimateBudget({
      nights: 3,
      partySize: 1,
      ticketTier: "grandstand",
      hotelTier: "standard",
      flightPerPerson: 200
    })
    // tickets 400, flights 200, hotel 1 room * 140 * 3 = 420, spend 60*1*4 = 240
    expect(b.tickets).toBe(400)
    expect(b.flights).toBe(200)
    expect(b.accommodation).toBe(420)
    expect(b.spending).toBe(240)
    expect(b.total).toBe(1260)
    expect(b.perPerson).toBe(1260)
  })

  it("shares rooms across a party (2 per room)", () => {
    const b = estimateBudget({
      nights: 2,
      partySize: 3,
      ticketTier: "general",
      hotelTier: "standard",
      flightPerPerson: 0
    })
    // 3 people -> 2 rooms * 140 * 2 nights = 560
    expect(b.accommodation).toBe(560)
    expect(b.tickets).toBe(450) // 150 * 3
  })

  it("honours a ticket price override", () => {
    const b = estimateBudget({
      nights: 1,
      partySize: 2,
      ticketTier: "premium",
      hotelTier: "hostel",
      flightPerPerson: 0,
      ticketPriceOverride: 500
    })
    expect(b.tickets).toBe(1000) // override 500 * 2, ignores premium default
  })

  it("never divides by zero on party size", () => {
    const b = estimateBudget({
      nights: 0,
      partySize: 0,
      ticketTier: "general",
      hotelTier: "hostel",
      flightPerPerson: 0
    })
    expect(Number.isFinite(b.perPerson)).toBe(true)
  })
})
