import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { contrastRatio } from "@/lib/color-contrast"
import { countryFlagEmoji } from "@/lib/country-flag"
import { isMissingRaceImage } from "@/lib/race-image"
import { RaceCircuitImage } from "@/components/races/race-circuit-image"
import {
  RACE_FALLBACK_INK,
  RACE_FALLBACK_PAPER,
  RaceImageFallback
} from "@/components/races/race-image-fallback"

describe("country flag", () => {
  it("maps stored country names and ignores unknown ones", () => {
    expect(countryFlagEmoji("Portugal")).toBe("🇵🇹")
    expect(countryFlagEmoji("USA")).toBe(countryFlagEmoji("United States"))
    expect(countryFlagEmoji(" UK ")).toBe("🇬🇧")
    expect(countryFlagEmoji("Fixtureland")).toBeNull()
    expect(countryFlagEmoji(null)).toBeNull()
    expect(countryFlagEmoji("")).toBeNull()
  })
})

describe("missing race image", () => {
  it("treats empty and the generic stock photo as missing", () => {
    expect(isMissingRaceImage(null)).toBe(true)
    expect(isMissingRaceImage(undefined)).toBe(true)
    expect(isMissingRaceImage("")).toBe(true)
    expect(isMissingRaceImage("  ")).toBe(true)
    expect(isMissingRaceImage("/assets/placeholder.jpg")).toBe(true)
    expect(
      isMissingRaceImage("https://cdn.example/assets/placeholder.jpg?w=10")
    ).toBe(true)
    expect(isMissingRaceImage("/android-chrome-512x512.png")).toBe(false)
  })
})

describe("race image fallback", () => {
  it("keeps paper on ink at or above 4.5:1", () => {
    expect(
      contrastRatio(RACE_FALLBACK_PAPER, RACE_FALLBACK_INK)
    ).toBeGreaterThanOrEqual(4.5)
  })

  it("renders the circuit name, series, and flag without a photo or wordmark", () => {
    const html = renderToStaticMarkup(
      createElement(RaceImageFallback, {
        title: "Portimão Circuit",
        series: "MotoGP",
        country: "Portugal"
      })
    )

    expect(html).toContain("data-race-image-fallback")
    expect(html).toContain("Portimão Circuit")
    expect(html).toContain("MotoGP")
    expect(html).toContain("🇵🇹")
    expect(html).toContain("Portugal")
    expect(html).not.toContain("placeholder.jpg")
    expect(html).not.toContain("<img")
    expect(html).not.toMatch(/PitLane|Pit Lane/i)
    expect(html).not.toMatch(/formula\s*1|ferrari|mclaren|mercedes/i)
  })

  it("omits a flag when the country is not already known", () => {
    const html = renderToStaticMarkup(
      createElement(RaceImageFallback, {
        title: "Synthetic E2E Circuit",
        series: "F1",
        country: "Fixtureland"
      })
    )
    expect(html).not.toContain("data-country-flag")
    expect(html).toContain("Fixtureland")
  })

  it("uses the fallback for a missing photo and next/image only for a real src", () => {
    const missing = renderToStaticMarkup(
      createElement(RaceCircuitImage, {
        src: null,
        alt: "Portimão Circuit",
        label: {
          title: "Portimão Circuit",
          series: "MotoGP",
          country: "Portugal"
        }
      })
    )
    expect(missing).toContain("data-race-image-fallback")
    expect(missing).not.toContain("<img")
    expect(missing).not.toContain("placeholder.jpg")

    const generic = renderToStaticMarkup(
      createElement(RaceCircuitImage, {
        src: "/assets/placeholder.jpg",
        alt: "Portimão Circuit",
        label: { title: "Portimão Circuit", series: "MotoGP" }
      })
    )
    expect(generic).toContain("data-race-image-fallback")
    expect(generic).not.toContain("<img")

    const photo = renderToStaticMarkup(
      createElement(RaceCircuitImage, {
        src: "/android-chrome-512x512.png",
        alt: "Synthetic E2E Circuit"
      })
    )
    expect(photo).toContain("<img")
    expect(photo).toContain("/android-chrome-512x512.png")
    expect(photo).not.toContain("data-race-image-fallback")
  })
})
