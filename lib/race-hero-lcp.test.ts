import { describe, expect, it } from "vitest"
import { raceHeroLcpHref, RACE_HERO_LCP_WIDTH } from "./race-hero-lcp"

describe("raceHeroLcpHref", () => {
  it("preloads the 750-wide optimizer URL the Lighthouse phone selects", () => {
    const href = raceHeroLcpHref(
      "https://example.test/circuit_images/start.jpg"
    )
    expect(href).toBe(
      `/_next/image?url=${encodeURIComponent("https://example.test/circuit_images/start.jpg")}&w=${RACE_HERO_LCP_WIDTH}&q=65`
    )
  })

  it("returns null when the race has no photo", () => {
    expect(raceHeroLcpHref(null)).toBeNull()
    expect(raceHeroLcpHref("  ")).toBeNull()
  })
})
