import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { raceRowWithSeries } from "./race-api-row"

describe("raceRowWithSeries", () => {
  it("keeps a Formula E slug on the refreshed row", () => {
    const row = raceRowWithSeries(
      { id: "race-1", season: 2026, name: "Tokyo E-Prix 2026" },
      "formula-e"
    )
    expect(row.series).toEqual({ slug: "formula-e" })
    expect(row.season).toBe(2026)
  })

  it("does not invent a series when the join has no slug", () => {
    expect(raceRowWithSeries({ id: "race-2" }, null).series).toBeNull()
    expect(raceRowWithSeries({ id: "race-2" }, "  ").series).toBeNull()
  })
})

describe("GET /api/races series join", () => {
  it("selects the series slug for the admin refresh", () => {
    const source = readFileSync(
      path.join(process.cwd(), "app/api/races/route.ts"),
      "utf8"
    )
    expect(source).toMatch(/leftJoin\(\s*seriesTable/)
    expect(source).toMatch(/seriesTable\.slug/)
    expect(source).toMatch(/raceRowWithSeries/)
  })
})
