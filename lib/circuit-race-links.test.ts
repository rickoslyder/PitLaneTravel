import { describe, expect, it } from "vitest"
import {
  grandstandHrefForCircuit,
  grandstandPagePath,
  partOfRaceGuideLabel,
  racePagePath,
  raceTicketsPath,
  upcomingRaceLink,
  type CircuitRaceCandidate
} from "./circuit-race-links"

const NOW = new Date("2026-11-24T12:00:00.000Z")

function race(
  overrides: Partial<CircuitRaceCandidate> &
    Pick<CircuitRaceCandidate, "id" | "name">
): CircuitRaceCandidate {
  return {
    slug: "monaco-grand-prix-f1-2027",
    date: new Date("2027-05-23T13:00:00.000Z"),
    status: "upcoming",
    weekendStart: new Date("2027-05-21T08:00:00.000Z"),
    weekendEnd: new Date("2027-05-23T16:00:00.000Z"),
    ...overrides
  }
}

describe("upcoming race links", () => {
  it("picks the soonest race a visitor can still attend", () => {
    const link = upcomingRaceLink(
      [
        race({
          id: "later",
          name: "Monaco Grand Prix 2027",
          slug: "monaco-grand-prix-f1-2027",
          date: new Date("2027-05-23T13:00:00.000Z"),
          weekendStart: new Date("2027-05-21T08:00:00.000Z")
        }),
        race({
          id: "sooner",
          name: "Australian Grand Prix 2027",
          slug: "australian-grand-prix-f1-2027",
          date: new Date("2027-03-14T05:00:00.000Z"),
          weekendStart: new Date("2027-03-12T03:00:00.000Z"),
          weekendEnd: new Date("2027-03-14T07:00:00.000Z")
        })
      ],
      NOW
    )

    expect(link).toEqual({
      name: "Australian Grand Prix 2027",
      href: "/races/australian-grand-prix-f1-2027",
      ticketsHref: "/races/australian-grand-prix-f1-2027?tab=tickets"
    })
    expect(partOfRaceGuideLabel(link!.name)).toBe(
      "Part of the Australian Grand Prix 2027 guide"
    )
  })

  it("keeps a live weekend ahead of a later race", () => {
    const link = upcomingRaceLink(
      [
        race({
          id: "future",
          name: "Later Grand Prix",
          slug: "later-grand-prix",
          date: new Date("2027-01-01T12:00:00.000Z"),
          weekendStart: new Date("2027-01-01T08:00:00.000Z"),
          weekendEnd: new Date("2027-01-03T12:00:00.000Z")
        }),
        race({
          id: "live",
          name: "Live Grand Prix",
          slug: "live-grand-prix",
          status: "upcoming",
          date: new Date("2026-11-24T10:00:00.000Z"),
          weekendStart: new Date("2026-11-24T06:00:00.000Z"),
          weekendEnd: new Date("2026-11-24T18:00:00.000Z")
        })
      ],
      NOW
    )

    expect(link?.href).toBe("/races/live-grand-prix")
    expect(link?.ticketsHref).toBe("/races/live-grand-prix?tab=tickets")
  })

  it("hides the link when every race is finished or cancelled", () => {
    const link = upcomingRaceLink(
      [
        race({
          id: "done",
          name: "Finished Grand Prix",
          slug: "finished-grand-prix",
          status: "completed",
          date: new Date("2024-06-01T12:00:00.000Z"),
          weekendStart: new Date("2024-05-31T08:00:00.000Z"),
          weekendEnd: new Date("2024-06-02T16:00:00.000Z")
        }),
        race({
          id: "off",
          name: "Cancelled Grand Prix",
          slug: "cancelled-grand-prix",
          status: "cancelled",
          date: new Date("2027-07-01T12:00:00.000Z"),
          weekendStart: null,
          weekendEnd: null
        })
      ],
      NOW
    )

    expect(link).toBeNull()
  })

  it("drops a stale upcoming row whose weekend has already ended", () => {
    const link = upcomingRaceLink(
      [
        race({
          id: "stale",
          name: "Stale Grand Prix",
          slug: "stale-grand-prix",
          status: "upcoming",
          date: new Date("2026-10-01T12:00:00.000Z"),
          weekendStart: new Date("2026-09-30T08:00:00.000Z"),
          weekendEnd: new Date("2026-10-02T16:00:00.000Z")
        })
      ],
      NOW
    )

    expect(link).toBeNull()
  })

  it("skips a broken path and uses the next open race", () => {
    const link = upcomingRaceLink(
      [
        race({
          id: "not a safe id",
          name: "Bad Slug Grand Prix",
          slug: "../admin",
          date: new Date("2026-12-01T12:00:00.000Z"),
          weekendStart: new Date("2026-12-01T08:00:00.000Z"),
          weekendEnd: new Date("2026-12-03T12:00:00.000Z")
        }),
        race({
          id: "safe",
          name: "Safe Grand Prix",
          slug: "safe-grand-prix",
          date: new Date("2027-01-01T12:00:00.000Z"),
          weekendStart: new Date("2027-01-01T08:00:00.000Z"),
          weekendEnd: new Date("2027-01-03T12:00:00.000Z")
        })
      ],
      NOW
    )

    expect(link?.href).toBe("/races/safe-grand-prix")
  })

  it("builds only internal race and grandstand paths", () => {
    expect(racePagePath({ id: "abc", slug: "https://example.com/go/1" })).toBe(
      "/races/abc"
    )
    expect(
      racePagePath({ id: "../admin", slug: "https://example.com/go/1" })
    ).toBeNull()
    expect(raceTicketsPath({ id: "abc-def", slug: null })).toBe(
      "/races/abc-def?tab=tickets"
    )
    expect(raceTicketsPath({ id: "abc", slug: "spa-2027" })).not.toMatch(
      /\/go\/|\/api\/redirect\//
    )
    expect(grandstandPagePath("Yas Marina Circuit")).toBe(
      "/circuits/yas-marina-circuit/grandstands"
    )
    expect(grandstandHrefForCircuit("Yas Marina Circuit", 0)).toBeNull()
    expect(grandstandHrefForCircuit("Yas Marina Circuit", 2)).toBe(
      "/circuits/yas-marina-circuit/grandstands"
    )
    expect(grandstandPagePath("***")).toBeNull()
  })
})
