import { describe, expect, it } from "vitest"
import {
  GRANDSTAND_PRICE_LEGEND,
  formatBestFor,
  formatCoverSun,
  formatPriceTier,
  formatSunExposure,
  formatViewRating,
  grandstandComparedPhrase
} from "./grandstand-copy"

describe("formatBestFor", () => {
  it("keeps a stored Best label and only adds the prefix when it is missing", () => {
    expect(formatBestFor("Best overall")).toBe("Best overall")
    expect(formatBestFor("Best for first-timers")).toBe("Best for first-timers")
    expect(formatBestFor("first-timers")).toBe("Best for first-timers")
    expect(formatBestFor("Best overall — the harbour front")).toBe(
      "Best overall — the harbour front"
    )
    expect(formatBestFor("Best action — heavy braking into Stowe")).toBe(
      "Best action — heavy braking into Stowe"
    )
    expect(formatBestFor("best for first-timers — Turn 1")).toBe(
      "Best for first-timers — Turn 1"
    )
  })

  it("sentence-cases notes that do not start with Best", () => {
    expect(formatBestFor("High-speed cornering")).toBe(
      "Best for high-speed cornering"
    )
    expect(formatBestFor("Pit lane & pit-stop action")).toBe(
      "Best for pit lane & pit-stop action"
    )
    expect(
      formatBestFor("Photography & comfort — the classic Casino backdrop")
    ).toBe("Best for photography & comfort — the classic Casino backdrop")
    expect(formatBestFor("")).toBe("")
    expect(formatBestFor(null)).toBe("")
  })
})

describe("formatSunExposure", () => {
  it("uses a capitalised label and does not say shaded sun", () => {
    expect(formatSunExposure("shaded")).toBe("Shaded")
    expect(formatSunExposure("SHADED")).toBe("Shaded")
    expect(formatSunExposure("shaded sun")).toBe("Shaded")
    expect(formatSunExposure("full")).toBe("Full sun")
    expect(formatSunExposure("full sun")).toBe("Full sun")
    expect(formatSunExposure("morning")).toBe("Morning sun")
    expect(formatSunExposure("afternoon")).toBe("Afternoon sun")
    expect(formatSunExposure("")).toBe("")
    expect(formatSunExposure(null)).toBe("")
  })
})

describe("formatCoverSun", () => {
  it("pairs the roof with the sun label", () => {
    expect(formatCoverSun(true, "shaded")).toBe("Covered, Shaded")
    expect(formatCoverSun(true, "full sun")).toBe("Covered, Full sun")
    expect(formatCoverSun(false, "afternoon")).toBe("Uncovered, Afternoon sun")
    expect(formatCoverSun(false, null)).toBe("Uncovered")
    expect(formatCoverSun(true, "shaded sun")).not.toMatch(/shaded sun/i)
  })
})

describe("formatViewRating", () => {
  it("prints a score out of five and skips a missing rating", () => {
    expect(formatViewRating(4)).toBe("4/5")
    expect(formatViewRating(4.2)).toBe("4/5")
    expect(formatViewRating(0)).toBe("")
    expect(formatViewRating(null)).toBe("")
  })
})

describe("formatPriceTier", () => {
  it("names the band and never prints a currency symbol or an amount", () => {
    expect(formatPriceTier("budget")).toBe("Budget")
    expect(formatPriceTier("mid")).toBe("Mid-range")
    expect(formatPriceTier("premium")).toBe("Premium")
    expect(formatPriceTier("PREMIUM")).toBe("Premium")
    expect(formatPriceTier("")).toBe("")
    expect(GRANDSTAND_PRICE_LEGEND).toMatch(/Budget, Mid-range and Premium/)
    expect(GRANDSTAND_PRICE_LEGEND).toMatch(/not ticket prices/)
    expect(GRANDSTAND_PRICE_LEGEND).not.toMatch(/[£$€]/)
    expect(formatPriceTier("premium")).not.toMatch(/[£$€]/)
  })
})

describe("grandstandComparedPhrase", () => {
  it("uses public wording", () => {
    expect(grandstandComparedPhrase(0)).toBe("grandstands compared")
    expect(grandstandComparedPhrase(1)).toBe("grandstand compared")
    expect(grandstandComparedPhrase(5)).toBe("grandstands compared")
  })
})
