import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { buildRaceSlug } from "@/lib/series"
import {
  raceDateFromSeed,
  seedHasClockTime,
  seedRaceSlug
} from "./refresh-f1-calendar"

const f1 = {
  name: "Formula 1",
  shortName: "F1",
  slug: "f1",
  eventNoun: "Grand Prix"
}

describe("f1-2026-calendar seed", () => {
  const data = JSON.parse(
    readFileSync(
      path.join(process.cwd(), "data/seeds/f1-2026-calendar.json"),
      "utf8"
    )
  ) as {
    races: Array<{
      round: number
      name: string
      slug?: string
      date: string
      sprint: boolean
      circuit: string
      country: string
    }>
  }

  it("is the verified 23-round calendar with official start times", () => {
    expect(data.races.map(race => race.round)).toEqual(
      Array.from({ length: 23 }, (_, index) => index + 1)
    )
    const sepang = data.races.find(race => race.round === 16)
    expect(sepang).toMatchObject({
      name: "Bahrain Grand Prix 2026",
      slug: "bahrain-grand-prix-in-malaysia-2026-f1-2026",
      circuit: "Petronas Sepang International Circuit",
      country: "Malaysia",
      date: "2026-10-04T07:00:00Z",
      sprint: false
    })
    expect(data.races.find(race => race.round === 17)?.name).toBe(
      "Singapore Grand Prix 2026"
    )
    expect(data.races.find(race => race.round === 23)?.name).toBe(
      "Abu Dhabi Grand Prix 2026"
    )
    expect(
      data.races.find(race => race.name.startsWith("Las Vegas"))?.date
    ).toBe("2026-11-22T04:00:00Z")
    expect(
      data.races.filter(race => race.sprint).map(race => race.name)
    ).toEqual([
      "Chinese Grand Prix 2026",
      "Miami Grand Prix 2026",
      "Canadian Grand Prix 2026",
      "British Grand Prix 2026",
      "Dutch Grand Prix 2026",
      "Singapore Grand Prix 2026"
    ])
    expect(data.races.every(race => seedHasClockTime(race.date))).toBe(true)
  })
})

describe("refresh-f1-calendar matching", () => {
  it("uses an explicit slug instead of the name-derived one", () => {
    expect(
      seedRaceSlug(
        f1,
        {
          name: "Bahrain Grand Prix 2026",
          country: "Malaysia",
          slug: "bahrain-grand-prix-in-malaysia-2026-f1-2026"
        },
        2026
      )
    ).toBe("bahrain-grand-prix-in-malaysia-2026-f1-2026")
    expect(
      buildRaceSlug(f1, {
        name: "Bahrain Grand Prix 2026",
        country: "Malaysia",
        season: 2026
      })
    ).toBe("bahrain-grand-prix-2026-f1-2026")
  })

  it("keeps an existing clock when the seed date has no time", () => {
    const stored = new Date("2026-11-22T04:00:00.000Z")
    expect(raceDateFromSeed("2026-11-22", stored).toISOString()).toBe(
      "2026-11-22T04:00:00.000Z"
    )
  })

  it("writes an official start instant from the seed", () => {
    const stored = new Date("2026-11-22T00:00:00.000Z")
    expect(raceDateFromSeed("2026-11-22T04:00:00Z", stored).toISOString()).toBe(
      "2026-11-22T04:00:00.000Z"
    )
  })
})
