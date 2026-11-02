import { describe, expect, it } from "vitest"
import { getGuide } from "./guides"
import { guideSlugForRace } from "./race-guide-links"

describe("race page guide links", () => {
  it("links only the 2026 Abu Dhabi race page to the evergreen guide", () => {
    expect(guideSlugForRace("abu-dhabi-grand-prix-2026-f1-2026")).toBe(
      "abu-dhabi-grand-prix-travel-guide"
    )
    expect(guideSlugForRace("abu-dhabi-grand-prix-2025")).toBeNull()
    expect(guideSlugForRace("british-grand-prix-2026-f1-2026")).toBeNull()
    expect(guideSlugForRace(null)).toBeNull()
    expect(guideSlugForRace(undefined)).toBeNull()
  })
})

describe("Abu Dhabi guide", () => {
  it("publishes the expanded 2026 copy and does not link the 2025 race page", () => {
    const guide = getGuide("abu-dhabi-grand-prix-travel-guide")
    expect(guide).not.toBeNull()
    expect(guide!.title).toBe(
      "Abu Dhabi Grand Prix 2026: Dates, Hotels & Getting There"
    )
    expect(guide!.headline).toBe(
      "Abu Dhabi Grand Prix travel guide: dates, where to stay and getting to Yas Marina"
    )
    expect(guide!.description).toBe(
      "Plan the Abu Dhabi Grand Prix yourself: Yas Island vs downtown vs Dubai, getting to Yas Marina, official ticket prices with dates, and the 2027 race date."
    )
    expect(guide!.body).toContain(
      "The 2026 Abu Dhabi Grand Prix runs from Friday 4 to Sunday 6 December at Yas Marina Circuit and is the final round of the season."
    )
    expect(guide!.body).toContain(
      "Some links on this page are affiliate links."
    )
    expect(guide!.body).toContain("https://airalo.pxf.io/PzEM6e")
    expect(guide!.body).toContain("https://f1.pxf.io/5kEv72")
    expect(guide!.body).not.toContain("omio.sjv.io")
    expect(guide!.body).toContain("](/races/abu-dhabi-grand-prix-2026-f1-2026)")
    expect(guide!.body).not.toContain("abu-dhabi-grand-prix-2025")
    expect(guide!.body).not.toContain("/workspace/")
    expect(guide!.body).not.toContain("editor_flags")
    expect(guide!.body).not.toContain("pitlanetravel.com")
    expect(guide!.body).not.toContain("/guides/buying-f1-tickets-safely")
    expect(guide!.body).not.toMatch(/\/races\/[^)\s]*2027/)
    expect(guide!.body).toContain(
      "https://www.formula1.com/en/racing/2026/united-arab-emirates"
    )
    expect(guide!.body).toContain("## Doing Qatar too")
    expect(guide!.body).toContain("Khaleej Times")
    expect(guide!.body).toContain("AED 20")
    expect(guide!.body).toContain("paid parking")
    expect(guide!.body).not.toContain("StubHub")
    expect(guide!.body).not.toMatch(/\[40\]/)
    const sources = guide!.body.slice(guide!.body.indexOf("## Sources"))
    expect(sources).not.toMatch(/^2\. /m)
    expect(sources).not.toMatch(/^30\. /m)
    expect(sources).not.toMatch(/^40\. /m)
    expect(guide!.body).toContain(
      "Fan tips are based on fan reports in r/GrandPrixTravel"
    )
    expect(guide!.body).toContain("## Sources")
    expect(guide!.body).not.toContain("## Date verification")
    expect(guide!.body).not.toMatch(/\bHOLD\b/)
    expect(guide!.body).not.toMatch(/\bTODO\b/)
    expect(guide!.body).not.toContain("P1 Travel")
    expect(guide!.body).not.toContain("<!--")
    expect(guide!.body).not.toContain("Abu Dhabi Grand Prix 2027: Dates")
    expect(guide!.relatedRaces).toEqual([
      "qatar-grand-prix-2026-f1-2026",
      "abu-dhabi-grand-prix-2026-f1-2026",
      "las-vegas-grand-prix-2026-f1-2026"
    ])
    expect(guide!.relatedRaces.some(slug => slug.includes("2025"))).toBe(false)
  })
})
