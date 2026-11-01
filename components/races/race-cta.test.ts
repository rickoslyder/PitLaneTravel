import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

function read(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), "utf8").replace(
    /\s+/g,
    " "
  )
}

const noSell = "PitLane Travel does not currently sell race-weekend packages"

describe("race page CTAs match the about-page limit", () => {
  const about = read("app/(marketing)/about/page.tsx")
  const calendar = read("components/races/HeroSection.tsx")
  const hero = read("components/races/hero/RaceHero.tsx")
  const planner = read("components/trip-planner-button.tsx")

  it("keeps the calendar limit and the shipped about-page copy", () => {
    expect(about).toMatch(/siteCopy/)
    expect(about).toMatch(/AffiliateDisclosure/)
    expect(about).not.toContain(noSell)
    expect(calendar).toContain(noSell)
    expect(calendar).toMatch(/does not book or issue flights/)
    expect(calendar).toMatch(/does not sell tickets/)
    expect(calendar).not.toMatch(/\bbook your\b/i)
  })

  it("keeps the listing-aware hero CTA and hides it when the race has finished", () => {
    const ticketCta = read("components/races/hero/HeroTicketCta.tsx")
    expect(hero).toMatch(/HeroTicketCta/)
    expect(hero).toMatch(/FinishedRaceNotice/)
    expect(hero).not.toMatch(/Book Now/)
    expect(hero).not.toMatch(/\bpurchase\b/i)
    expect(ticketCta).toMatch(/SEE_TRAVEL_OPTIONS_LABEL/)
    expect(ticketCta).toMatch(/Book Now/)
    expect(planner).not.toMatch(/booking integration coming soon/i)
    expect(planner).toMatch(/does not book or issue flights/)
    expect(planner).toMatch(/does not sell/)
  })
})
