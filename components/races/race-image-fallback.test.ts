import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { contrastRatio } from "@/lib/color-contrast"
import { countryFlagEmoji } from "@/lib/country-flag"
import { firstRaceIdWithImage, isMissingRaceImage } from "@/lib/race-image"
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

  it("prioritises the first card that has a photo, not the first index", () => {
    const races = [
      {
        id: "portugal",
        circuit: { image_url: null }
      },
      {
        id: "placeholder",
        circuit: { image_url: "/assets/placeholder.jpg" }
      },
      {
        id: "spain",
        circuit: { image_url: "/images/barcelona.jpg" }
      }
    ]

    expect(firstRaceIdWithImage(races)).toBe("spain")
    expect(firstRaceIdWithImage([])).toBeUndefined()
    expect(
      firstRaceIdWithImage([{ id: "empty", circuit: { image_url: "  " } }])
    ).toBeUndefined()
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
    expect(photo).toContain('loading="lazy"')
    expect(photo.toLowerCase()).not.toContain("fetchpriority")
    expect(photo).not.toContain("data-race-image-fallback")
  })

  it("omits fetchpriority on ordinary next/image photos and sets high without lazy", () => {
    const ordinary = renderToStaticMarkup(
      createElement(RaceCircuitImage, {
        src: "/android-chrome-512x512.png",
        alt: "Synthetic E2E Circuit",
        fill: true
      })
    )
    expect(ordinary.toLowerCase()).not.toContain("fetchpriority")
    expect(ordinary).not.toContain('fetchpriority="auto"')
    expect(ordinary).toContain('loading="lazy"')

    const priority = renderToStaticMarkup(
      createElement(RaceCircuitImage, {
        src: "/android-chrome-512x512.png",
        alt: "Synthetic E2E Circuit",
        fill: true,
        priority: true
      })
    )
    expect(priority.toLowerCase()).toContain('fetchpriority="high"')
    expect(priority).not.toContain('loading="lazy"')
  })

  it("shares the first-photo priority with every RaceGrid, including series pages", () => {
    const root = process.cwd()
    const grid = readFileSync(
      path.join(root, "components/races/RaceGrid.tsx"),
      "utf8"
    )
    const series = readFileSync(
      path.join(root, "app/series/[slug]/page.tsx"),
      "utf8"
    )
    const races = readFileSync(
      path.join(root, "components/races/RacesPage.tsx"),
      "utf8"
    )

    expect(grid).toContain("firstRaceIdWithImage")
    expect(grid).not.toContain("index === 0")
    expect(grid).not.toContain('fetchPriority="auto"')
    expect(series).toContain("<RaceGrid")
    // The calendar LCP element is the h1, so its cards stay lazy and are
    // server-rendered. Series pages still prioritise their first photo.
    const listing = readFileSync(
      path.join(root, "components/races/race-listing-card.tsx"),
      "utf8"
    )
    expect(races).not.toMatch(/^\s*["']use client["']/m)
    expect(races).toContain("<ListingCardView")
    expect(listing).not.toMatch(/priority\s*:/)
    expect(listing).not.toContain('fetchPriority="high"')
    expect(listing).not.toContain('fetchpriority="high"')
    const cardFrame =
      "(max-width: 640px) calc(100vw - 8rem), (max-width: 1024px) 50vw, 33vw"
    expect(listing).toContain(cardFrame)
    expect(listing).not.toContain("(max-width: 640px) 100vw")

    const card = readFileSync(
      path.join(root, "components/races/RaceCard.tsx"),
      "utf8"
    )
    expect(card).toContain(cardFrame)
    expect(card).not.toContain("(max-width: 640px) 100vw")
    expect(races).not.toContain("RaceGrid")
    expect(races).not.toContain("RaceCard")

    const controls = readFileSync(
      path.join(root, "components/races/race-calendar-controls.tsx"),
      "utf8"
    )
    expect(controls.match(/data-races-series-filters/g)).toEqual([
      "data-races-series-filters"
    ])
    expect(races).not.toContain("data-races-series-filters")
    expect(grid).not.toContain("data-races-series-filters")
  })
})
