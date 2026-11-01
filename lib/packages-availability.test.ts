import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: never[]) => unknown) => fn
}))
vi.mock("@/db/db", () => ({
  db: {
    select: () => {
      throw new Error("db down")
    }
  }
}))

import {
  AVAILABILITY_DEFAULTS,
  computePackagesAvailability,
  getPackagesAvailability,
  type CandidatePackage
} from "@/lib/packages-availability"

const now = new Date("2026-06-01T12:00:00Z")

function row(overrides: Partial<CandidatePackage> = {}): CandidatePackage {
  return {
    raceId: "race-f1",
    seriesSlug: "f1",
    validFrom: new Date("2026-01-01T00:00:00Z"),
    validTo: null,
    raceStatus: "upcoming",
    raceDate: new Date("2026-07-01T12:00:00Z"),
    weekendStart: null,
    weekendEnd: null,
    includesFlights: null,
    ...overrides
  }
}

describe("computePackagesAvailability", () => {
  it("is closed when nothing is listed", () => {
    const result = computePackagesAvailability([], now)
    expect(result.siteWide).toBe(false)
    expect(result.byRace("race-f1")).toBe(false)
  })

  it("lists a current F1 package on an upcoming race", () => {
    const result = computePackagesAvailability([row()], now)
    expect(result.siteWide).toBe(true)
    expect(result.byRace("race-f1")).toBe(true)
    expect(result.byRace("other-race")).toBe(false)
  })

  it("ignores a package whose validity window is closed or not open yet", () => {
    const past = computePackagesAvailability(
      [row({ validTo: new Date("2026-05-01T00:00:00Z") })],
      now
    )
    const future = computePackagesAvailability(
      [row({ validFrom: new Date("2026-08-01T00:00:00Z") })],
      now
    )
    expect(past.siteWide).toBe(false)
    expect(future.siteWide).toBe(false)
  })

  it("ignores cancelled and completed races", () => {
    const cancelled = computePackagesAvailability(
      [row({ raceStatus: "cancelled" })],
      now
    )
    const completed = computePackagesAvailability(
      [row({ raceDate: new Date("2026-01-01T12:00:00Z") })],
      now
    )
    expect(cancelled.siteWide).toBe(false)
    expect(completed.siteWide).toBe(false)
  })

  it("ignores series other than F1 and MotoGP", () => {
    const result = computePackagesAvailability([row({ seriesSlug: "wec" })], now)
    expect(result.siteWide).toBe(false)
  })

  it("counts only packages without flights when option (a) is on", () => {
    const opts = { excludeFlightPackages: true, requireF1AndMotoGP: false }
    expect(
      computePackagesAvailability([row({ includesFlights: true })], now, opts).siteWide
    ).toBe(false)
    expect(
      computePackagesAvailability([row({ includesFlights: null })], now, opts).siteWide
    ).toBe(false)
    expect(
      computePackagesAvailability([row({ includesFlights: false })], now, opts).siteWide
    ).toBe(true)
  })

  it("requires both F1 and MotoGP when option (b) is on", () => {
    const opts = { excludeFlightPackages: false, requireF1AndMotoGP: true }
    const f1Only = computePackagesAvailability([row()], now, opts)
    const both = computePackagesAvailability(
      [row(), row({ raceId: "race-motogp", seriesSlug: "motogp" })],
      now,
      opts
    )
    expect(f1Only.siteWide).toBe(false)
    expect(f1Only.byRace("race-f1")).toBe(true)
    expect(both.siteWide).toBe(true)
  })

  it("defaults both options off", () => {
    expect(AVAILABILITY_DEFAULTS).toEqual({
      excludeFlightPackages: false,
      requireF1AndMotoGP: false
    })
    expect(computePackagesAvailability([row()], now).siteWide).toBe(true)
  })
})

describe("getPackagesAvailability", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("fails closed when the database query throws", async () => {
    const result = await getPackagesAvailability()
    expect(result.siteWide).toBe(false)
    expect(result.byRace("race-f1")).toBe(false)
  })
})
