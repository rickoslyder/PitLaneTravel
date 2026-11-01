import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { officialTicketOffer } from "./official-ticket-sellers"

describe("official ticket seller season switch", () => {
  it("sends F1 2026 to the previous store and 2027 onward to the current store", () => {
    expect(officialTicketOffer({ seriesSlug: "f1", season: 2026 })).toEqual({
      href: "https://tickets.formula1.com/",
      label: "Buy from the official F1® Ticket Store",
      note: "Official series ticket store. Not an affiliate link; Pit Lane Travel earns nothing from this purchase."
    })
    expect(officialTicketOffer({ seriesSlug: "f1", season: 2027 })?.href).toBe(
      "https://ticketing.formula1.com/"
    )
    expect(officialTicketOffer({ seriesSlug: "f1", season: 2028 })?.href).toBe(
      "https://ticketing.formula1.com/"
    )
    expect(officialTicketOffer({ seriesSlug: "F1", season: 2027 })?.href).toBe(
      "https://ticketing.formula1.com/"
    )
  })

  it("does not invent an F1 store for a season that was not sourced", () => {
    expect(officialTicketOffer({ seriesSlug: "f1", season: 2025 })).toBeNull()
    expect(officialTicketOffer({ seriesSlug: "f1", season: null })).toBeNull()
  })

  it("uses one MotoGP store for every season", () => {
    const note =
      "Official series ticket store. Not an affiliate link; Pit Lane Travel earns nothing from this purchase."
    for (const season of [2025, 2026, 2030]) {
      expect(officialTicketOffer({ seriesSlug: "motogp", season })).toEqual({
        href: "https://tickets.motogp.com/en/",
        label: "Buy from the official MotoGP™ Ticket Store",
        note
      })
    }
  })

  it("points Formula E at the official hub for every season", () => {
    expect(
      officialTicketOffer({ seriesSlug: "formula-e", season: 2026 })
    ).toEqual({
      href: "https://www.fiaformulae.com/en/tickets",
      label: "Find tickets on Formula E's official tickets page",
      note: "Formula E sells each race through a local official ticketing partner (for example Ticketmaster or webook); you'll be passed on from fiaformulae.com. Not an affiliate link."
    })
    expect(
      officialTicketOffer({ seriesSlug: "formula-e", season: 2027 })?.href
    ).toBe("https://www.fiaformulae.com/en/tickets")
  })

  it("keeps the official link off affiliate cards and finished races", () => {
    const root = process.cwd()
    const section = readFileSync(
      path.join(root, "components/races/tickets/TicketSection.tsx"),
      "utf8"
    )
    const card = readFileSync(
      path.join(root, "components/races/tickets/TicketCard.tsx"),
      "utf8"
    )
    expect(section).toMatch(/raceHasFinished/)
    expect(section).toMatch(/OfficialTicketLink/)
    expect(section).not.toMatch(/website_url/)
    expect(section).not.toMatch(/tickets\.formula1\.com/)
    expect(card).not.toMatch(/Buy from the official F1/)
    expect(card).not.toMatch(/Buy from the official MotoGP/)
    expect(card).toMatch(/Buy from \$\{affiliatePartner\}/)
  })

  it("leaves series without a sourced store unlinked", () => {
    expect(officialTicketOffer({ seriesSlug: "wec", season: 2026 })).toBeNull()
    expect(
      officialTicketOffer({ seriesSlug: "indycar", season: 2026 })
    ).toBeNull()
    expect(officialTicketOffer({ seriesSlug: null, season: 2026 })).toBeNull()
  })
})
