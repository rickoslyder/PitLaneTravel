import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { SITE_ORIGIN } from "@/lib/site-metadata"
import {
  buildRaceTrailJsonLd,
  raceCompareTrail,
  raceDetailTrail,
  raceHistoryTrail,
  raceMapTrail,
  racePlanningLinks,
  racesIndexTrail
} from "@/lib/race-trail"

const root = process.cwd()

function read(relativePath: string): string {
  return readFileSync(path.join(root, relativePath), "utf8")
}

describe("race trail", () => {
  it("keeps the visible names and BreadcrumbList JSON-LD in the same order", () => {
    const items = raceDetailTrail(
      "British Grand Prix",
      "/races/british-grand-prix-2026"
    )
    const jsonLd = buildRaceTrailJsonLd(items)

    expect(items.map(item => item.name)).toEqual([
      "Home",
      "Races",
      "British Grand Prix"
    ])
    expect(jsonLd["@type"]).toBe("BreadcrumbList")
    expect(jsonLd.itemListElement.map(item => item.name)).toEqual(
      items.map(item => item.name)
    )
    expect(jsonLd.itemListElement.map(item => item.item)).toEqual([
      `${SITE_ORIGIN}/`,
      `${SITE_ORIGIN}/races`,
      `${SITE_ORIGIN}/races/british-grand-prix-2026`
    ])
    expect(jsonLd.itemListElement.map(item => item.position)).toEqual([1, 2, 3])
  })

  it("drops the extra calendar level on the index, map, compare, and history", () => {
    expect(racesIndexTrail.map(item => item.name)).toEqual(["Home", "Races"])
    expect(raceMapTrail.map(item => item.name)).toEqual([
      "Home",
      "Races",
      "Map"
    ])
    expect(raceCompareTrail.map(item => item.name)).toEqual([
      "Home",
      "Races",
      "Compare"
    ])
    expect(
      raceHistoryTrail("Monaco Grand Prix", "/races/monaco-grand-prix").map(
        item => item.name
      )
    ).toEqual(["Home", "Races", "Monaco Grand Prix", "History"])
    expect(
      raceHistoryTrail("Monaco Grand Prix", "/races/monaco-grand-prix").at(-1)
        ?.path
    ).toBe("/races/monaco-grand-prix/history")

    for (const items of [
      racesIndexTrail,
      raceMapTrail,
      raceCompareTrail,
      raceDetailTrail("Race", "/races/race")
    ]) {
      expect(items.map(item => item.name)).not.toContain("Race Calendar")
      expect(
        buildRaceTrailJsonLd(items).itemListElement.map(item => item.name)
      ).toEqual(items.map(item => item.name))
    }
  })

  it("relocates the live sidebar destinations and leaves missing routes unpublished", () => {
    expect(racePlanningLinks.map(link => link.href)).toEqual([
      "/races/map",
      "/races/compare",
      "/hotels",
      "/transport"
    ])
    const trail = read("components/races/race-trail.tsx")
    const footer = read("components/site-footer.tsx")
    expect(trail).toContain("racePlanningLinks")
    expect(footer).toContain("racePlanningLinks")
    for (const source of [trail, footer, read("lib/race-trail.ts")]) {
      expect(source).not.toContain("/trips/shared")
      expect(source).not.toContain("/trips/archive")
      expect(source).not.toContain("/circuits/guide")
      expect(source).not.toContain("/circuits/weather")
    }
  })

  it("renders one trail from the same items as the JSON-LD on each race route", () => {
    const trail = read("components/races/race-trail.tsx")
    expect(trail).toContain("buildRaceTrailJsonLd(items)")
    expect(trail).toContain("item.name")
    expect(trail).not.toContain("<main")

    expect(read("app/races/page.tsx")).toContain("racesIndexTrail")
    expect(read("app/races/[id]/page.tsx")).toContain("raceDetailTrail(")
    expect(read("app/races/[id]/history/page.tsx")).toContain(
      "raceHistoryTrail("
    )
    expect(read("app/races/map/page.tsx")).toContain("raceMapTrail")
    expect(read("app/races/compare/page.tsx")).toContain("raceCompareTrail")
    expect(read("app/races/layout.tsx")).not.toContain("AppSidebar")
    expect(read("app/races/layout.tsx")).toContain("PublicShell")
  })
})
