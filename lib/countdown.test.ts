import { describe, expect, it } from "vitest"
import { buildHeroCountdownSeed } from "./countdown"

const now = new Date("2026-11-24T17:00:00.000Z")

describe("buildHeroCountdownSeed", () => {
  it("picks the earliest open race and carries later races for the client", () => {
    const seed = buildHeroCountdownSeed(
      [
        {
          name: "Abu Dhabi Grand Prix 2026",
          status: "upcoming",
          date: "2026-12-06T13:00:00.000Z",
          circuit: { name: "Yas Marina Circuit", timezone_id: "Asia/Dubai" }
        },
        {
          name: "Grand Prix of Valencia 2026",
          status: "upcoming",
          date: "2026-11-29T00:00:00.000Z",
          weekend_end: null,
          circuit: { name: "Circuit Ricardo Tormo", timezone_id: null }
        },
        {
          name: "Qatar Grand Prix 2026",
          status: "upcoming",
          date: "2026-11-29T16:00:00.000Z",
          circuit: {
            name: "Lusail International Circuit",
            timezone_id: "Asia/Qatar"
          }
        }
      ],
      now
    )

    expect(seed?.name).toBe("Grand Prix of Valencia 2026")
    expect(seed?.date).toBe("2026-11-29T00:00:00.000Z")
    expect(seed?.circuitName).toBe("Circuit Ricardo Tormo")
    expect(seed?.initialTime?.days).toBe(4)
    expect(seed?.candidates?.map(candidate => candidate.name)).toEqual([
      "Grand Prix of Valencia 2026",
      "Qatar Grand Prix 2026",
      "Abu Dhabi Grand Prix 2026"
    ])
  })

  it("drops a future date whose weekend end is already past", () => {
    const seed = buildHeroCountdownSeed(
      [
        {
          name: "Grand Prix of Valencia 2026",
          status: "upcoming",
          date: "2026-11-29T00:00:00.000Z",
          weekendEnd: "2026-11-22T18:00:00.000Z",
          circuit: { name: "Circuit Ricardo Tormo" }
        },
        {
          name: "Qatar Grand Prix 2026",
          status: "upcoming",
          date: "2026-11-29T16:00:00.000Z",
          circuit: {
            name: "Lusail International Circuit",
            timezone_id: "Asia/Qatar"
          }
        }
      ],
      now
    )

    expect(seed?.name).toBe("Qatar Grand Prix 2026")
    expect(seed?.candidates?.map(candidate => candidate.name)).toEqual([
      "Qatar Grand Prix 2026"
    ])
  })

  it("keeps a date-only race through that calendar day, then moves on", () => {
    const races = [
      {
        name: "Grand Prix of Valencia 2026",
        status: "upcoming" as const,
        date: "2026-11-29T00:00:00.000Z",
        circuit: { name: "Circuit Ricardo Tormo", timezone_id: null }
      },
      {
        name: "Qatar Grand Prix 2026",
        status: "upcoming" as const,
        date: "2026-11-29T16:00:00.000Z",
        circuit: {
          name: "Lusail International Circuit",
          timezone_id: "Asia/Qatar"
        }
      }
    ]

    expect(
      buildHeroCountdownSeed(races, new Date("2026-11-29T12:00:00.000Z"))?.name
    ).toBe("Grand Prix of Valencia 2026")
    expect(
      buildHeroCountdownSeed(races, new Date("2026-11-30T00:00:00.000Z"))?.name
    ).toBe("Qatar Grand Prix 2026")
  })

  it("returns nothing once every countdown target has passed", () => {
    expect(
      buildHeroCountdownSeed(
        [
          {
            name: "Grand Prix of Portugal 2026",
            status: "completed",
            date: "2026-11-22T00:00:00.000Z"
          },
          {
            name: "Las Vegas Grand Prix 2026",
            status: "upcoming",
            date: "2026-11-22T04:00:00.000Z",
            timeZone: "America/Los_Angeles"
          }
        ],
        now
      )
    ).toBeNull()
  })
})
