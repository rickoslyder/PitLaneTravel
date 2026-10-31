import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { SERIES_BY_SLUG } from "./series"
import {
  FORMULA_E_LONDON_VENUE_NOTE,
  isEvergreenFormulaELondonVenue,
  withFormulaELondonVenueNote
} from "./formula-e-london"

describe("Formula E London venue note", () => {
  it("states the Season 13 move to Brands Hatch", () => {
    expect(FORMULA_E_LONDON_VENUE_NOTE).toBe(
      "Formula E London moves to Brands Hatch for Season 13 (29-30 May 2027, provisional)."
    )
    expect(SERIES_BY_SLUG["formula-e"].description).toContain("Brands Hatch")
    expect(SERIES_BY_SLUG["formula-e"].description).toContain("29-30 May 2027")
  })

  it("adds the note to evergreen Formula E copy and not to other series", () => {
    expect(
      withFormulaELondonVenueNote(
        "formula-e",
        "All-electric single-seaters racing on street circuits in the heart of major cities."
      )
    ).toContain(FORMULA_E_LONDON_VENUE_NOTE)

    expect(
      withFormulaELondonVenueNote(
        "formula-e",
        `Street circuits. ${FORMULA_E_LONDON_VENUE_NOTE}`
      )
    ).toBe(`Street circuits. ${FORMULA_E_LONDON_VENUE_NOTE}`)

    expect(withFormulaELondonVenueNote("f1", "Grand prix weekends.")).toBe(
      "Grand prix weekends."
    )
  })

  it("matches ExCeL and Brands Hatch venue names only", () => {
    expect(isEvergreenFormulaELondonVenue("ExCeL London Circuit")).toBe(true)
    expect(isEvergreenFormulaELondonVenue("Brands Hatch")).toBe(true)
    expect(isEvergreenFormulaELondonVenue("Silverstone Circuit")).toBe(false)
    expect(isEvergreenFormulaELondonVenue("London")).toBe(false)
  })

  it("leaves the 2026 London E-Prix seed at ExCeL", () => {
    const seed = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "data/seeds/multi-series-2026-calendars.json"),
        "utf8"
      )
    ) as {
      series: {
        "formula-e": {
          rounds: Array<{ name: string; circuit: string }>
        }
      }
    }

    const london = seed.series["formula-e"].rounds.filter(round =>
      round.name.startsWith("London E-Prix 2026")
    )

    expect(london.map(round => round.name).sort()).toEqual([
      "London E-Prix 2026 (Race 1)",
      "London E-Prix 2026 (Race 2)"
    ])
    for (const round of london) {
      expect(round.circuit).toBe("ExCeL London Circuit")
    }
    expect(JSON.stringify(london)).not.toContain("Brands Hatch")
  })
})
