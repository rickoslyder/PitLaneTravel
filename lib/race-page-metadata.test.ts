import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  buildRaceHistoryDescription,
  buildRaceHistoryHeading,
  buildRacePageMetadata,
  RACE_PAGE_NOT_FOUND_DESCRIPTION
} from "./race-page-metadata"

const wec = {
  slug: "wec",
  name: "World Endurance Championship",
  short_name: "WEC"
}

const f1 = {
  slug: "f1",
  name: "Formula 1",
  short_name: "F1"
}

describe("race page metadata", () => {
  it("titles a WEC race from the race name and labels the copy WEC", () => {
    const copy = buildRacePageMetadata({
      raceName: "24 Hours of Le Mans 2026",
      series: wec,
      circuitName: "Circuit de la Sarthe",
      circuitLocation: "Le Mans"
    })

    expect(copy.title).toBe("24 Hours of Le Mans 2026: Race Weekend Guide")
    expect(copy.openGraph.title).toBe(copy.title)
    expect(copy.description).toContain("Circuit de la Sarthe")
    expect(copy.description).toContain("in Le Mans")
    expect(copy.description).toContain("unforgettable WEC weekend")
    expect(copy.openGraph.description).toBe(copy.description)
    expect(copy.seriesHeading).toBe("WEC")
    expect(copy.title).not.toContain("F1")
    expect(copy.description).not.toMatch(/\bF1\b/)
    expect(buildRaceHistoryHeading(wec)).toBe(
      "Explore the fascinating history and memorable moments of this WEC race."
    )
    expect(
      buildRaceHistoryDescription({
        raceName: "24 Hours of Le Mans 2026",
        series: wec
      })
    ).toContain("(WEC)")
  })

  it("titles an F1 race from the race name and keeps the F1 series label", () => {
    const copy = buildRacePageMetadata({
      raceName: "Australian Grand Prix 2026",
      series: f1,
      circuitName: "Albert Park Circuit",
      circuitLocation: "Melbourne"
    })

    expect(copy.title).toBe("Australian Grand Prix 2026: Race Weekend Guide")
    expect(copy.openGraph.title).toBe(copy.title)
    expect(copy.description).toContain("Albert Park Circuit")
    expect(copy.description).toContain("in Melbourne")
    expect(copy.description).toContain("unforgettable F1 weekend")
    expect(copy.openGraph.description).toBe(copy.description)
    expect(copy.seriesHeading).toBe("F1")
    expect(copy.title).not.toContain("F1 Race Weekend Guide")
    expect(buildRaceHistoryHeading(f1)).toBe(
      "Explore the fascinating history and memorable moments of this F1 race."
    )
    expect(
      buildRaceHistoryDescription({
        raceName: "Australian Grand Prix 2026",
        series: f1
      })
    ).toContain("(F1)")
  })

  it("keeps the 2026 London E-Prix description at ExCeL and labels it Formula E", () => {
    const copy = buildRacePageMetadata({
      raceName: "London E-Prix 2026 (Race 1)",
      series: { slug: "formula-e", name: "Formula E", short_name: "FE" },
      circuitName: "ExCeL London Circuit",
      circuitLocation: "London"
    })

    expect(copy.title).toBe("London E-Prix 2026 (Race 1): Race Weekend Guide")
    expect(copy.description).toContain("ExCeL London Circuit")
    expect(copy.description).toContain("unforgettable Formula E weekend")
    expect(copy.seriesHeading).toBe("Formula E")
    expect(copy.description).not.toContain("Brands Hatch")
    expect(copy.title).not.toMatch(/\bF1\b/)
    expect(copy.description).not.toMatch(/\bF1\b/)
  })

  it("does not call an unknown series F1", () => {
    const copy = buildRacePageMetadata({
      raceName: "Example Race 2026",
      series: null,
      circuitName: null,
      circuitLocation: null
    })

    expect(copy.title).toBe("Example Race 2026: Race Weekend Guide")
    expect(copy.description).toContain("at the circuit")
    expect(copy.description).toContain("unforgettable race weekend")
    expect(copy.seriesHeading).toBeNull()
    expect(copy.description).not.toMatch(/\bF1\b/)
    expect(RACE_PAGE_NOT_FOUND_DESCRIPTION).not.toMatch(/Formula 1/)
  })
})

describe("race page sources", () => {
  const root = process.cwd()

  it("builds race-page metadata from the series-aware helper", () => {
    const page = readFileSync(
      path.join(root, "app/races/[id]/page.tsx"),
      "utf8"
    )
    const history = readFileSync(
      path.join(root, "app/races/[id]/history/page.tsx"),
      "utf8"
    )
    const historyView = readFileSync(
      path.join(root, "components/races/RaceHistoryPage.tsx"),
      "utf8"
    )
    const hero = readFileSync(
      path.join(root, "components/races/hero/RaceHero.tsx"),
      "utf8"
    )

    expect(page).toMatch(/buildRacePageMetadata/)
    expect(page).not.toMatch(/F1 Race Weekend Guide/)
    expect(page).not.toMatch(/unforgettable F1/)
    expect(page).not.toMatch(/Formula 1 race weekend/)
    expect(history).toMatch(/buildRaceHistoryDescription/)
    expect(history).not.toMatch(/Formula 1/)
    expect(historyView).toMatch(/buildRaceHistoryHeading/)
    expect(historyView).not.toMatch(/Formula 1/)
    expect(hero).toMatch(/seriesHeading/)
  })

  it("loads series on the single-race reads the race page uses", () => {
    const source = readFileSync(
      path.join(root, "actions/db/races-actions.ts"),
      "utf8"
    )
    const byId = source.slice(
      source.indexOf("export async function getRaceByIdAction"),
      source.indexOf("export async function deleteRaceAction")
    )
    const bySlug = source.slice(
      source.indexOf("export async function getRaceBySlugAction")
    )

    for (const block of [byId, bySlug]) {
      expect(block).toMatch(/leftJoin\(\s*seriesTable/)
      expect(block).toMatch(/short_name:\s*seriesTable\.shortName/)
      expect(block).toMatch(/slug:\s*seriesTable\.slug/)
    }
  })
})
