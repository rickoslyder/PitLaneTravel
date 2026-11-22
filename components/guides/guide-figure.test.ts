import { existsSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { GuideFigure } from "@/components/guides/guide-figure"
import {
  guideFigureAssetPaths,
  guideFigureCopy,
  segmentGuide
} from "@/components/guides/guide-figures"
import { firstTimersPage } from "@/content/race-hub-subpages/first-timers"
import { whatToBringPage } from "@/content/race-hub-subpages/what-to-bring"
import { withKidsPage } from "@/content/race-hub-subpages/with-kids"
import { getGuide } from "@/lib/guides"

const root = process.cwd()

function figureIds(routeKey: string, source: string): string[] {
  return segmentGuide(routeKey, source).flatMap(segment =>
    segment.kind === "figure" ? [segment.figure.id] : []
  )
}

function guideSource(slug: string): string {
  const guide = getGuide(slug)
  if (!guide) throw new Error(`missing guide ${slug}`)
  const prefix = `# ${guide.headline}`
  if (!guide.body.startsWith(prefix)) return guide.body
  return guide.body.slice(prefix.length).replace(/^\n+/, "")
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

  it("places the other guide figures and leaves out the Baku price ladder", () => {
    expect(
      figureIds(
        "abu-dhabi-grand-prix-travel-guide",
        guideSource("abu-dhabi-grand-prix-travel-guide")
      )
    ).toEqual([
      "hero-yas-sunset",
      "b1-session-times",
      "b3-exit-plan",
      "b4-concert-nights"
    ])
    expect(
      figureIds(
        "azerbaijan-grand-prix-2027-tickets-travel",
        guideSource("azerbaijan-grand-prix-2027-tickets-travel")
      )
    ).toEqual(["hero-maiden-tower", "b2-baku-locator", "b3-bulvar-night"])
    expect(
      figureIds(
        "f1-2027-ticket-on-sale-dates",
        guideSource("f1-2027-ticket-on-sale-dates")
      )
    ).toEqual([
      "hero-status-board",
      "b1-sale-day-checklist",
      "b2-who-sells-what"
    ])
    expect(
      figureIds(
        "two-races-one-trip-2027",
        guideSource("two-races-one-trip-2027")
      )
    ).toEqual([
      "hero-europe-route-map",
      "b1-pairings-timeline",
      "b3-north-america-map",
      "b2-clash-weekends"
    ])
    expect(
      figureIds("wec-2027-launch-week", guideSource("wec-2027-launch-week"))
    ).toEqual([
      "hero-silverstone-wing",
      "b1-season-calendar",
      "b2-uk-reach-map"
    ])
    expect(
      figureIds("which-race-first-2027", guideSource("which-race-first-2027"))
    ).toEqual([
      "hero-five-weekends",
      "b2-weekend-shape",
      "b1-fan-type-cards",
      "b3-first-race-calendar"
    ])

    const ids = guideFigureCopy().map(copy => copy.id)
    expect(ids).not.toContain("b1-price-ladder")
    expect(guideFigureAssetPaths().join("\n")).not.toContain("price-ladder")
    expect(ids).toHaveLength(33)
  })
})
