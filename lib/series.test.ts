import { describe, it, expect } from "vitest"
import {
  formatEventName,
  slugify,
  buildRaceSlug,
  extractSeasonFromSlug
} from "./series"

const f1 = { name: "Formula 1", shortName: "F1", slug: "f1", eventNoun: "Grand Prix" }
const fe = { name: "Formula E", shortName: "FE", slug: "formula-e", eventNoun: "E-Prix" }

describe("formatEventName", () => {
  it("passes through an explicit race name", () => {
    expect(formatEventName(f1, { name: "Monaco Grand Prix 2026" })).toBe(
      "Monaco Grand Prix 2026"
    )
  })

  it("composes from country + series eventNoun + season when no name", () => {
    expect(formatEventName(fe, { country: "Berlin", season: 2026 })).toBe(
      "Berlin E-Prix 2026"
    )
  })

  it("falls back to Grand Prix when no series", () => {
    expect(formatEventName(null, { country: "Monaco", season: 2026 })).toBe(
      "Monaco Grand Prix 2026"
    )
  })
})

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("São Paulo Grand Prix")).toBe("sao-paulo-grand-prix")
  })
})

describe("buildRaceSlug", () => {
  it("includes series slug and season", () => {
    expect(
      buildRaceSlug(f1, { country: "Monaco", season: 2026 })
    ).toBe("monaco-grand-prix-f1-2026")
  })
})

describe("extractSeasonFromSlug", () => {
  it("finds any 4-digit season, not just 2025", () => {
    expect(extractSeasonFromSlug("berlin-e-prix-formula-e-2027")).toBe(2027)
    expect(extractSeasonFromSlug("monaco-grand-prix-f1-2026")).toBe(2026)
  })
  it("returns null when no year present", () => {
    expect(extractSeasonFromSlug("monaco-grand-prix")).toBeNull()
  })
})
