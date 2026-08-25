import { describe, expect, it } from "vitest"
import type { SelectRace } from "@/db/schema/races-schema"
import { ManualProvider } from "./manual-provider"

function makeRace(overrides: Partial<SelectRace>): SelectRace {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    circuitId: "00000000-0000-0000-0000-000000000002",
    seriesId: null,
    name: "Test Grand Prix",
    date: new Date("2026-07-04T12:00:00.000Z"),
    season: 2026,
    round: 1,
    plannedRound: null,
    country: "Testland",
    description: null,
    cancellationReason: null,
    weekendStart: new Date("2026-07-04T12:00:00.000Z"),
    weekendEnd: new Date("2026-07-05T18:00:00.000Z"),
    status: "upcoming",
    slug: "test-grand-prix-2026",
    isSprintWeekend: false,
    openf1MeetingKey: null,
    openf1SessionKey: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides
  }
}

describe("ManualProvider.deriveStatus", () => {
  const provider = new ManualProvider()

  it("delegates to the shared half-open contract and preserves cancellation", () => {
    const weekendStart = new Date("2026-07-04T12:00:00.000Z")
    const weekendEnd = new Date("2026-07-05T18:00:00.000Z")
    const race = makeRace({ weekendStart, weekendEnd, date: weekendStart })

    expect(provider.deriveStatus(race, weekendStart)).toBe("in_progress")
    expect(provider.deriveStatus(race, weekendEnd)).toBe("completed")
    expect(
      provider.deriveStatus({ ...race, status: "cancelled" }, weekendStart)
    ).toBe("cancelled")
  })
})
