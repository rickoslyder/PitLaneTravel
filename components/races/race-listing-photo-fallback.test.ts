import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { ListingCardView } from "./race-listing-card-view"
import type { ListingCardModel } from "./race-listing-card-view"

const model: ListingCardModel = {
  id: "race-1",
  timing: "upcoming",
  seriesSlug: "f1",
  seriesLabel: "F1",
  seriesColor: "#e10600",
  name: "Australian Grand Prix",
  circuitName: "Albert Park",
  country: "Australia",
  location: "Melbourne",
  month: "March",
  dateIso: "2026-03-15T00:00:00.000Z",
  dateLabel: "Mar 15, 2026",
  href: "/races/australian-grand-prix",
  cancelled: false,
  cancellationReason: null,
  coverage: {
    raceId: "race-1",
    tier: 3,
    liveOfferState: "current",
    freshUntil: null,
    derivedAt: "2026-03-01T00:00:00.000Z"
  },
  image: {
    src: "/_next/image?url=%2Fphoto.jpg&w=640&q=65",
    srcSet:
      "/_next/image?url=%2Fphoto.jpg&w=384&q=65 384w, /_next/image?url=%2Fphoto.jpg&w=640&q=65 640w",
    sizes: "(max-width: 640px) calc(100vw - 8rem), 33vw",
    alt: "Albert Park"
  },
  fallbackTitle: "Albert Park",
  fallbackSeries: "F1",
  fallbackCountry: "Australia"
}

describe("listing photo fallback", () => {
  it("ships responsive candidates and the designed card behind every photo", () => {
    const html = renderToStaticMarkup(createElement(ListingCardView, { model }))
    expect(html).toContain("384w")
    expect(html).toContain("640w")
    expect(html).toContain("data-race-image-fallback")
    expect(html.match(/data-race-image-fallback/g)).toHaveLength(1)
    expect(html).toMatch(
      /<h3[^>]*>Australian Grand Prix<\/h3><div[^>]*data-coverage-badge=""/
    )
    expect(html).toContain('loading="lazy"')
    expect(html).not.toContain("data-race-photo-credit")
  })

  it("keeps a hosted credit inside the 16:9 frame and lazy-loads the photo", () => {
    const html = renderToStaticMarkup(
      createElement(ListingCardView, {
        model: {
          ...model,
          image: {
            ...model.image!,
            alt: "A Formula E car on track"
          },
          photoCredit: {
            author: "Morio",
            licence: "CC BY-SA 4.0",
            licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0",
            commonsUrl: "https://commons.wikimedia.org/wiki/File:Example.jpg"
          }
        }
      })
    )
    expect(html).toContain("aspect-[16/9]")
    expect(html).toContain('loading="lazy"')
    expect(html).toContain("data-race-photo-credit")
    expect(html).toContain("CC BY-SA 4.0")
    expect(html).toContain("https://creativecommons.org/licenses/by-sa/4.0")
    expect(html).toContain("Wikimedia Commons")
    expect(html.indexOf("aspect-[16/9]")).toBeLessThan(
      html.indexOf("data-race-photo-credit")
    )
  })

  it("reveals that card from one error listener instead of a client image per card", () => {
    const root = process.cwd()
    const controls = readFileSync(
      path.join(root, "components/races/race-calendar-controls.tsx"),
      "utf8"
    )
    const handler = readFileSync(
      path.join(root, "components/races/race-listing-photo-fallback.ts"),
      "utf8"
    )
    expect(controls).toContain("revealListingPhotoFallback")
    expect(controls).toMatch(/addEventListener\(\s*["']error["']/)
    expect(handler).toContain('setAttribute("data-race-photo-failed", "")')
    expect(handler).toContain(".race-listing-photo")
  })
})
