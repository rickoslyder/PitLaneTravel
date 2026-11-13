import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = process.cwd()

describe("upcoming race card image", () => {
  it("uses the designed fallback instead of the generic placeholder photo", () => {
    const source = readFileSync(
      path.join(root, "components/landing/upcoming-races.tsx"),
      "utf8"
    )

    expect(source).not.toContain("placeholder.jpg")
    expect(source).not.toContain('from "next/image"')
    expect(source).toContain("RaceCircuitImage")
    expect(source).toContain("raceCardImageLabel")
    expect(source).toContain("data-race-card")
    expect(source).toContain("formatRaceCalendarDate")
    expect(source).not.toContain("toLocaleDateString")

    const image = readFileSync(
      path.join(root, "components/races/race-circuit-image.tsx"),
      "utf8"
    )
    expect(image).toContain('from "next/image"')
    expect(image).toContain("<Image")
    expect(image).toContain("RaceImageFallback")
    expect(image).not.toContain("placeholder.jpg")
  })
})
