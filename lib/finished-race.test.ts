import { describe, expect, it } from "vitest"
import { raceHasFinished } from "./finished-race"

const now = new Date("2026-10-31T23:00:00.000Z")

describe("raceHasFinished", () => {
  it("treats a past end, or a completed status, as finished", () => {
    expect(
      raceHasFinished(
        {
          status: "upcoming",
          date: "2025-12-05T16:00:00.000Z",
          weekend_end: "2025-12-06T20:00:00.000Z"
        },
        now
      )
    ).toBe(true)
    expect(
      raceHasFinished(
        {
          status: "completed",
          date: "2026-12-06T13:00:00.000Z",
          weekend_end: "2026-12-06T20:00:00.000Z"
        },
        now
      )
    ).toBe(true)
  })

  it("leaves upcoming, in-progress, and cancelled races bookable", () => {
    expect(
      raceHasFinished(
        {
          status: "upcoming",
          date: "2026-12-06T13:00:00.000Z",
          weekend_end: "2026-12-06T20:00:00.000Z"
        },
        now
      )
    ).toBe(false)
    expect(
      raceHasFinished(
        {
          status: "in_progress",
          date: "2026-10-31T12:00:00.000Z",
          weekend_end: "2026-11-01T18:00:00.000Z"
        },
        now
      )
    ).toBe(false)
    expect(
      raceHasFinished(
        {
          status: "cancelled",
          date: "2025-01-01T00:00:00.000Z",
          weekend_end: "2025-01-02T00:00:00.000Z"
        },
        now
      )
    ).toBe(false)
  })

  it("uses the race date plus a day when the weekend end is missing", () => {
    expect(
      raceHasFinished(
        { status: "upcoming", date: "2026-10-30T22:00:00.000Z" },
        now
      )
    ).toBe(true)
    expect(
      raceHasFinished(
        { status: "upcoming", date: "2026-10-31T12:00:00.000Z" },
        now
      )
    ).toBe(false)
  })
})
