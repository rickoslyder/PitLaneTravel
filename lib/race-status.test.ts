import { describe, expect, it } from "vitest"
import {
  countdownWeekendEndMs,
  deriveRaceStatus,
  isActiveRaceStatus,
  selectNextCountdownRace
} from "./race-status"

const weekendStart = new Date("2026-07-04T12:00:00.000Z")
const weekendEnd = new Date("2026-07-05T18:00:00.000Z")

describe("deriveRaceStatus", () => {
  it("preserves explicit cancellation and treats the start instant as in_progress", () => {
    const race = {
      date: weekendStart,
      weekendStart,
      weekendEnd
    }

    expect(
      deriveRaceStatus({ ...race, status: "cancelled" }, weekendStart)
    ).toBe("cancelled")
    expect(
      deriveRaceStatus({ ...race, status: "upcoming" }, weekendStart)
    ).toBe("in_progress")
  })

  it("classifies the instant before start as upcoming", () => {
    expect(
      deriveRaceStatus(
        {
          status: "upcoming",
          date: weekendStart,
          weekendStart,
          weekendEnd
        },
        new Date(weekendStart.getTime() - 1)
      )
    ).toBe("upcoming")
  })

  it("classifies the end instant as completed", () => {
    expect(
      deriveRaceStatus(
        {
          status: "in_progress",
          date: weekendStart,
          weekendStart,
          weekendEnd
        },
        weekendEnd
      )
    ).toBe("completed")
  })

  it("classifies the instant before end as in_progress", () => {
    expect(
      deriveRaceStatus(
        {
          status: "upcoming",
          date: weekendStart,
          weekendStart,
          weekendEnd
        },
        new Date(weekendEnd.getTime() - 1)
      )
    ).toBe("in_progress")
  })

  it("classifies a weekend that crosses UTC midnight by absolute instants", () => {
    const start = new Date("2026-11-01T22:00:00.000Z")
    const end = new Date("2026-11-02T06:00:00.000Z")
    const afterMidnight = new Date("2026-11-02T00:30:00.000Z")
    const race = {
      status: "upcoming" as const,
      date: start,
      weekendStart: start,
      weekendEnd: end
    }

    expect(deriveRaceStatus(race, new Date(start.getTime() - 1))).toBe(
      "upcoming"
    )
    expect(deriveRaceStatus(race, afterMidnight)).toBe("in_progress")
    expect(deriveRaceStatus(race, end)).toBe("completed")
  })

  it("falls back to race date and date plus 24 hours when the weekend range is missing", () => {
    const date = new Date("2026-08-01T14:00:00.000Z")
    const race = { status: "upcoming" as const, date }

    expect(deriveRaceStatus(race, new Date(date.getTime() - 1))).toBe(
      "upcoming"
    )
    expect(deriveRaceStatus(race, date)).toBe("in_progress")
    expect(
      deriveRaceStatus(race, new Date(date.getTime() + 24 * 60 * 60 * 1000 - 1))
    ).toBe("in_progress")
    expect(
      deriveRaceStatus(race, new Date(date.getTime() + 24 * 60 * 60 * 1000))
    ).toBe("completed")
  })

  it("uses race date as start when weekendStart is missing", () => {
    const date = new Date("2026-08-02T14:00:00.000Z")
    const weekendEnd = new Date("2026-08-03T18:00:00.000Z")
    const race = { status: "upcoming" as const, date, weekendEnd }

    expect(deriveRaceStatus(race, new Date(date.getTime() - 1))).toBe(
      "upcoming"
    )
    expect(deriveRaceStatus(race, date)).toBe("in_progress")
    expect(deriveRaceStatus(race, weekendEnd)).toBe("completed")
  })

  it("uses date plus 24 hours as end when weekendEnd is missing", () => {
    const weekendStart = new Date("2026-07-31T10:00:00.000Z")
    const date = new Date("2026-08-02T14:00:00.000Z")
    const fallbackEnd = new Date(date.getTime() + 24 * 60 * 60 * 1000)
    const race = { status: "upcoming" as const, date, weekendStart }

    expect(deriveRaceStatus(race, new Date(weekendStart.getTime() - 1))).toBe(
      "upcoming"
    )
    expect(deriveRaceStatus(race, weekendStart)).toBe("in_progress")
    expect(deriveRaceStatus(race, fallbackEnd)).toBe("completed")
  })

  it("throws on invalid required or effective timestamps", () => {
    const date = new Date("2026-08-01T14:00:00.000Z")
    const invalid = new Date(Number.NaN)
    const race = {
      status: "upcoming" as const,
      date,
      weekendStart: date,
      weekendEnd: new Date("2026-08-02T14:00:00.000Z")
    }

    expect(() => deriveRaceStatus({ ...race, date: invalid }, date)).toThrow(
      "Invalid race status timestamps"
    )
    expect(() => deriveRaceStatus(race, invalid)).toThrow(
      "Invalid race status timestamps"
    )
    expect(() =>
      deriveRaceStatus({ ...race, weekendStart: invalid }, date)
    ).toThrow("Invalid race status timestamps")
    expect(() =>
      deriveRaceStatus({ ...race, weekendEnd: invalid }, date)
    ).toThrow("Invalid race status timestamps")
  })

  it("throws when the effective end is earlier than the effective start", () => {
    const start = new Date("2026-08-02T14:00:00.000Z")
    const end = new Date("2026-08-01T14:00:00.000Z")

    expect(() =>
      deriveRaceStatus(
        {
          status: "upcoming",
          date: start,
          weekendStart: start,
          weekendEnd: end
        },
        start
      )
    ).toThrow("Race status end is earlier than start")
  })

  it("preserves cancellation even when timestamps are invalid or inverted", () => {
    const invalid = new Date(Number.NaN)
    const start = new Date("2026-08-02T14:00:00.000Z")
    const end = new Date("2026-08-01T14:00:00.000Z")

    expect(
      deriveRaceStatus({ status: "cancelled", date: invalid }, invalid)
    ).toBe("cancelled")
    expect(
      deriveRaceStatus(
        {
          status: "cancelled",
          date: start,
          weekendStart: start,
          weekendEnd: end
        },
        start
      )
    ).toBe("cancelled")
  })
})

describe("isActiveRaceStatus", () => {
  it("is upcoming or in_progress only — not completed or cancelled", () => {
    expect(isActiveRaceStatus("upcoming")).toBe(true)
    expect(isActiveRaceStatus("in_progress")).toBe(true)
    expect(isActiveRaceStatus("completed")).toBe(false)
    expect(isActiveRaceStatus("cancelled")).toBe(false)
  })
})

describe("selectNextCountdownRace", () => {
  it("stays on an open weekend, then moves to the next active race", () => {
    const now = new Date("2026-07-05T00:00:00.000Z")
    const inProgressPastDate = {
      id: "current",
      status: "in_progress" as const,
      date: "2026-07-04T12:00:00.000Z"
    }
    const nextUpcoming = {
      id: "next",
      status: "upcoming" as const,
      date: "2026-07-18T12:00:00.000Z"
    }
    const completedFutureDate = {
      id: "done",
      status: "completed" as const,
      date: "2026-08-01T12:00:00.000Z"
    }
    const cancelledFutureDate = {
      id: "axed",
      status: "cancelled" as const,
      date: "2026-07-11T12:00:00.000Z"
    }

    expect(
      selectNextCountdownRace(
        [
          inProgressPastDate,
          cancelledFutureDate,
          completedFutureDate,
          nextUpcoming
        ],
        now
      )?.id
    ).toBe("current")
    expect(
      selectNextCountdownRace(
        [
          inProgressPastDate,
          cancelledFutureDate,
          completedFutureDate,
          nextUpcoming
        ],
        new Date("2026-07-05T12:00:00.000Z")
      )?.id
    ).toBe("next")
  })

  it("keeps an in-progress weekend until its end", () => {
    const race = {
      id: "current",
      status: "in_progress" as const,
      date: "2026-07-04T12:00:00.000Z"
    }
    expect(
      selectNextCountdownRace([race], new Date("2026-07-05T00:00:00.000Z"))?.id
    ).toBe("current")
    expect(
      selectNextCountdownRace([race], new Date("2026-07-05T12:00:00.000Z"))
    ).toBeUndefined()
  })

  it("skips a future race whose weekend has already ended and keeps date order", () => {
    const now = new Date("2026-11-24T17:00:00.000Z")
    const staleValencia = {
      id: "valencia",
      status: "upcoming" as const,
      date: "2026-11-29T00:00:00.000Z",
      weekendEnd: "2026-11-22T18:00:00.000Z"
    }
    const qatar = {
      id: "qatar",
      status: "upcoming" as const,
      date: "2026-11-29T16:00:00.000Z"
    }
    const abuDhabi = {
      id: "abu-dhabi",
      status: "upcoming" as const,
      date: "2026-12-06T13:00:00.000Z"
    }

    expect(
      selectNextCountdownRace([abuDhabi, staleValencia, qatar], now)?.id
    ).toBe("qatar")
  })

  it("ends a date-only calendar day in the circuit zone, otherwise 24 hours after a real start", () => {
    const dateOnly = new Date("2026-11-29T00:00:00.000Z")
    expect(
      countdownWeekendEndMs({
        status: "upcoming",
        date: dateOnly
      })
    ).toBe(dateOnly.getTime() + 24 * 60 * 60 * 1000)
    expect(
      new Date(
        countdownWeekendEndMs({
          status: "upcoming",
          date: dateOnly,
          timeZone: "America/Los_Angeles"
        }) ?? 0
      ).toISOString()
    ).toBe("2026-11-30T08:00:00.000Z")
    expect(
      new Date(
        countdownWeekendEndMs({
          status: "upcoming",
          date: "2026-11-29T16:00:00.000Z",
          timeZone: "Asia/Qatar"
        }) ?? 0
      ).toISOString()
    ).toBe("2026-11-30T16:00:00.000Z")
  })
})
