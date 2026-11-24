import { describe, expect, it } from "vitest"
import {
  GRANDSTAND_PRICE_LEGEND,
  formatBestFor,
  formatPriceTier,
  formatSunExposure,
  grandstandComparedPhrase
} from "./grandstand-copy"

describe("formatBestFor", () => {
  it("strips a leading Best or Best for so the prefix is never doubled", () => {
    expect(formatBestFor("Best action — heavy braking into Stowe")).toBe(
      "Best for action — heavy braking into Stowe"
    )
    expect(formatBestFor("Best overall — the harbour front")).toBe(
      "Best for overall — the harbour front"
    )
    expect(formatBestFor("Best for first-timers — Turn 1 & lap starts")).toBe(
      "Best for first-timers — Turn 1 & lap starts"
    )
    expect(formatBestFor("Best for Best action")).toBe("Best for action")
    expect(formatBestFor("  BEST FOR  First-timers  ")).toBe(
      "Best for first-timers"
    )
  })

  it("keeps a single prefix and sentence-cases notes that do not start with Best", () => {
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
    expect(formatBestFor("Best")).toBe("")
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
