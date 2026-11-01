import { describe, expect, it } from "vitest"
import {
  raceIsOnOrAfter,
  racesForTiming,
  startOfUtcDay
} from "./race-calendar-window"

const asOf = "2026-10-31T00:00:00.000Z"

describe("race calendar window", () => {
  it("starts the comparison day at UTC midnight", () => {
    expect(
      startOfUtcDay(new Date("2026-10-31T23:30:00.000Z")).toISOString()
    ).toBe(asOf)
  })

  it("treats a race on the as-of day as upcoming and a 2025 race as past", () => {
    expect(raceIsOnOrAfter("2026-10-31T13:00:00.000Z", asOf)).toBe(true)
    expect(raceIsOnOrAfter("2026-12-06T13:00:00.000Z", asOf)).toBe(true)
    expect(raceIsOnOrAfter("2025-11-22T04:00:00.000Z", asOf)).toBe(false)
  })

  it("defaults the visible order to upcoming ascending and past descending", () => {
    const races = [
      { id: "vegas-2025", date: "2025-11-22T04:00:00.000Z" },
      { id: "abu-dhabi", date: "2026-12-06T13:00:00.000Z" },
      { id: "today", date: "2026-10-31T08:00:00.000Z" },
      { id: "sepang", date: "2026-11-01T07:00:00.000Z" }
    ]

    expect(
      racesForTiming(races, "upcoming", asOf).map(race => race.id)
    ).toEqual(["today", "sepang", "abu-dhabi"])
    expect(racesForTiming(races, "past", asOf).map(race => race.id)).toEqual([
      "vegas-2025"
    ])
  })
})
