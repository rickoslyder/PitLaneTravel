import { existsSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { firstTimersPage } from "@/content/race-hub-subpages/first-timers"
import { whatToBringPage } from "@/content/race-hub-subpages/what-to-bring"
import { withKidsPage } from "@/content/race-hub-subpages/with-kids"
import { GuideFigure } from "@/components/guides/guide-figure"
import {
  guideFigureAssetPaths,
  guideFigureCopy,
  segmentGuide
} from "@/components/guides/guide-figures"

const root = process.cwd()

function figureIds(routeKey: string, source: string): string[] {
  return segmentGuide(routeKey, source).flatMap(segment =>
    segment.kind === "figure" ? [segment.figure.id] : []
  )
}

describe("guide figures", () => {
  it("places the Abu Dhabi sub-page figures at their section anchors", () => {
    expect(
      figureIds(
        "abu-dhabi-grand-prix-travel-guide/first-timers",
        firstTimersPage.article ?? ""
      )
    ).toEqual([
      "hero-floodlights",
      "b1-three-things",
      "b3-ticket-includes",
      "b2-weekend-rhythm"
    ])
    expect(
      figureIds(
        "abu-dhabi-grand-prix-travel-guide/what-to-bring",
        whatToBringPage.article ?? ""
      )
    ).toEqual([
      "hero-packing-list",
      "b1-yes-no-board",
      "b2-camera-rule",
      "b3-day-to-night"
    ])
    expect(
      figureIds(
        "abu-dhabi-grand-prix-travel-guide/with-kids",
        withKidsPage.article ?? ""
      )
    ).toEqual([
      "hero-kids-go-free",
      "b1-age-ladder",
      "b2-family-kit",
      "b3-which-day"
    ])
  })

  it("renders a responsive picture with a short credit and no early-bird copy", () => {
    const segment = segmentGuide(
      "abu-dhabi-grand-prix-travel-guide/first-timers",
      firstTimersPage.article ?? ""
    ).find(
      item => item.kind === "figure" && item.figure.id === "hero-floodlights"
    )
    if (!segment || segment.kind !== "figure") {
      throw new Error("missing floodlights figure")
    }
    const html = renderToStaticMarkup(
      createElement(GuideFigure, { figure: segment.figure })
    )
    expect(html).toContain('type="image/webp"')
    expect(html).toContain('type="image/jpeg"')
    expect(html).toContain('media="(max-width: 639px)"')
    expect(html).toContain("hero-floodlights-mobile-800.webp")
    expect(html).toContain("hero-floodlights-desktop-1600.webp")
    expect(html).toContain(
      'src="/images/guides/abu-dhabi-grand-prix-travel-guide-first-timers/hero-floodlights-desktop-1600.jpg"'
    )
    expect(html).toContain('width="1600"')
    expect(html).toContain('height="900"')
    expect(html).toContain('width="800"')
    expect(html).toContain('height="600"')
    expect(html).toContain('loading="eager"')
    expect(html).toContain('fetchpriority="high"')
    expect(html).toContain(segment.figure.alt)
    expect(html).toContain(segment.figure.caption)
    expect(html).toContain("Cesar I. Martins")
    expect(html).toContain("CC BY 2.0")
    expect(html).not.toMatch(/early bird/i)
    expect(html).not.toMatch(/\b(?:Scout|Grawk|Writer|Studio|Grok)\b/)

    for (const copy of guideFigureCopy()) {
      expect(copy.alt, copy.id).not.toMatch(/early bird/i)
      expect(copy.caption, copy.id).not.toMatch(/early bird/i)
    }
  })

  it("keeps body graphics lazy and every asset on disk", () => {
    const segment = segmentGuide(
      "abu-dhabi-grand-prix-travel-guide/what-to-bring",
      whatToBringPage.article ?? ""
    ).find(
      item => item.kind === "figure" && item.figure.id === "hero-packing-list"
    )
    if (!segment || segment.kind !== "figure") {
      throw new Error("missing packing figure")
    }
    const html = renderToStaticMarkup(
      createElement(GuideFigure, { figure: segment.figure })
    )
    expect(html).toContain('loading="lazy"')
    expect(html).not.toContain("fetchpriority")
    expect(segment.figure.priority).toBe(false)

    for (const asset of guideFigureAssetPaths()) {
      const file = path.join(root, "public", asset.replace(/^\//, ""))
      expect(existsSync(file), asset).toBe(true)
    }
  })
})
