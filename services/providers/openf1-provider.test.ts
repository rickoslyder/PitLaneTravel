import { describe, expect, it } from "vitest"
import type { SelectRace } from "@/db/schema/races-schema"
import { deriveStatusWithoutOpenF1Session } from "./openf1-provider"

function makeRace(overrides: Partial<SelectRace>): SelectRace {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    circuitId: "00000000-0000-0000-0000-000000000002",
    seriesId: "2f9da9e4-331e-4ab4-b4ed-161e4970b318",
    name: "Hungarian Grand Prix 2026",
    date: new Date("2026-07-26T13:00:00.000Z"),
    season: 2026,
    round: 11,
    plannedRound: null,
    country: "Hungary",
    description: null,
    cancellationReason: null,
    weekendStart: null,
    weekendEnd: null,
    status: "in_progress",
    slug: "hungarian-grand-prix-2026-f1-2026",
    isSprintWeekend: false,
    openf1MeetingKey: null,
    openf1SessionKey: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  }
}

describe("OpenF1Provider status without a session key", () => {
  it("derives status from the race date when OpenF1 has no session", () => {
    const race = makeRace({ status: "in_progress" })
    expect(
      deriveStatusWithoutOpenF1Session(
        race,
        new Date("2026-07-28T13:00:00.000Z")
      )
    ).toBe("completed")
    expect(
      deriveStatusWithoutOpenF1Session(
        { ...race, status: "upcoming" },
        new Date("2026-07-26T12:00:00.000Z")
      )
    ).toBe("upcoming")
  })

  it("leaves session-keyed races to the OpenF1 feed", () => {
    const race = makeRace({ openf1SessionKey: 1234, status: "upcoming" })
    expect(
      deriveStatusWithoutOpenF1Session(
        race,
        new Date("2026-07-28T13:00:00.000Z")
      )
    ).toBeNull()
  })

  it("keeps cancellation sticky", () => {
    const race = makeRace({ status: "cancelled" })
    expect(
      deriveStatusWithoutOpenF1Session(
        race,
        new Date("2026-07-28T13:00:00.000Z")
      )
    ).toBe("cancelled")
  })
})
