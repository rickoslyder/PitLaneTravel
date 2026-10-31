import { describe, expect, it } from "vitest"
import { buildRacePageMetadata, raceHistoryIntro } from "./race-page-metadata"

const leMans = {
  raceName: "24 Hours of Le Mans 2026",
  series: {
    name: "World Endurance Championship",
    short_name: "WEC",
    slug: "wec"
  },
  circuitName: "Circuit de la Sarthe",
  location: "Le Mans"
}

const australianGrandPrix = {
  raceName: "Australian Grand Prix 2026",
  series: {
    name: "Formula 1",
    short_name: "F1",
    slug: "f1"
  },
  circuitName: "Albert Park Circuit",
  location: "Melbourne"
}

describe("buildRacePageMetadata", () => {
  it("titles a WEC race with WEC, not F1", () => {
    const metadata = buildRacePageMetadata(leMans)

    expect(metadata.title).toBe(
      "24 Hours of Le Mans 2026: WEC Race Weekend Guide | PitLane Travel"
    )
    expect(metadata.description).toContain("unforgettable WEC weekend")
    expect(metadata.description).not.toMatch(/\bF1\b/)
    expect(metadata.openGraph?.title).toBe(metadata.title)
    expect(metadata.openGraph?.description).toBe(metadata.description)
  })

  it("titles an F1 race with F1", () => {
    const metadata = buildRacePageMetadata(australianGrandPrix)

    expect(metadata.title).toBe(
      "Australian Grand Prix 2026: F1 Race Weekend Guide | PitLane Travel"
    )
    expect(metadata.description).toContain("unforgettable F1 weekend")
    expect(metadata.description).not.toMatch(/\bWEC\b/)
    expect(metadata.openGraph?.title).toBe(metadata.title)
    expect(metadata.openGraph?.description).toBe(metadata.description)
  })

  it("uses Formula E rather than the stored FE short name", () => {
    const metadata = buildRacePageMetadata({
      raceName: "Tokyo E-Prix 2026",
      series: { name: "Formula E", short_name: "FE", slug: "formula-e" }
    })

    expect(metadata.title).toContain("Formula E Race Weekend Guide")
    expect(metadata.title).not.toContain("FE Race Weekend Guide")
    expect(metadata.description).toContain("Formula E weekend")
  })

  it("does not invent F1 when the race has no series", () => {
    const metadata = buildRacePageMetadata({
      raceName: "24 Hours of Le Mans 2026",
      series: null
    })

    expect(metadata.title).toBe(
      "24 Hours of Le Mans 2026: Race Weekend Guide | PitLane Travel"
    )
    expect(metadata.description).toContain("unforgettable race weekend")
    expect(metadata.description).not.toMatch(/\bF1\b/)
  })
})

describe("raceHistoryIntro", () => {
  it("names the series on a WEC and an F1 race", () => {
    expect(raceHistoryIntro("WEC")).toBe(
      "Explore the fascinating history and memorable moments of this WEC race."
    )
    expect(raceHistoryIntro("F1")).toBe(
      "Explore the fascinating history and memorable moments of this F1 race."
    )
    expect(raceHistoryIntro(null)).not.toMatch(/Formula 1|F1/)
  })
})
