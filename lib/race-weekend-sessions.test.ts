import { describe, expect, it } from "vitest"
import { raceWeekendSessions } from "./race-weekend-sessions"

describe("race weekend sessions", () => {
  it("matches the travel tab's four day labels and does not invent a clock time", () => {
    const sessions = raceWeekendSessions(new Date("2026-12-06T13:00:00.000Z"))

    expect(sessions.map(session => session.description)).toEqual([
      "Thursday session — check organizer",
      "Practice Sessions",
      "Qualifying/Sprint",
      "Race Day"
    ])
    expect(
      sessions.map(session => session.date.toISOString().slice(0, 10))
    ).toEqual(["2026-12-03", "2026-12-04", "2026-12-05", "2026-12-06"])
    expect(JSON.stringify(sessions)).not.toMatch(/13:30|Practice 1/)
  })
})
