import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { YasMarinaLocator } from "@/components/maps/yas-marina-locator"

const root = process.cwd()

const SEATING_ALT =
  "North-up Yas Marina Circuit locator with Main, West, North, South and Marina grandstands and an approximate Abu Dhabi Hill point, numbered to a six-area key."

const STAY_ALT =
  "Coastal map placing central Abu Dhabi west of Yas Island and Dubai to the northeast, with Dubai Marina and Downtown Dubai examples and a local inset showing Al Danah, Yas Island and Yas Marina Circuit."

function render(kind: "seating" | "stay-zones") {
  return renderToStaticMarkup(createElement(YasMarinaLocator, { kind }))
}

function hrefsIn(html: string): string[] {
  return [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1])
}

describe("YasMarinaLocator", () => {
  it("renders the seating locator with alt text, art direction, and eager loading", () => {
    const html = render("seating")

    expect(html).toContain(`alt="${SEATING_ALT}"`)
    expect(html).toContain('data-locator="yas-marina-seating"')
    expect(html).toContain('media="(max-width: 639px)"')
    expect(html).toContain("/images/maps/yas-marina-seating-375.svg")
    expect(html).toContain("/images/maps/yas-marina-seating-375.png")
    expect(html).toContain("/images/maps/yas-marina-seating-desktop.svg")
    expect(html).toContain('src="/images/maps/yas-marina-seating-desktop.png"')
    expect(html).toContain('width="1200"')
    expect(html).toContain('height="960"')
    expect(html).toContain('width="375"')
    expect(html).toContain('height="1045"')
    expect(html).toContain("aspect-[1200/960]")
    expect(html).toContain("max-sm:aspect-[375/1045]")
    expect(html).toContain("width:100%")
    expect(html).toContain("height:auto")
    expect(html).toContain('loading="eager"')
    expect(html.toLowerCase()).not.toContain("fetchpriority")
    expect(html).toContain(">Expand seating map<")
    expect(html).toContain("Seating key")
    expect(html).toContain("Abu Dhabi Hill")
    expect(html).toContain("Approximate area, not an entrance")
    expect(html).toContain('href="https://www.openstreetmap.org/copyright"')
    expect(html).toContain("© OpenStreetMap contributors")
    expect(html).toContain(
      'href="https://opendatacommons.org/licenses/odbl/1-0/"'
    )
    expect(html).toContain(">ODbL<")
    expect(html).toContain('href="/data/maps/yas-marina-osm-derived.json"')
    expect(html).toContain(
      'href="https://www.abudhabigp.com/en/formula1/tickets-2026/north-grandstand-4day"'
    )
    expect(html).not.toContain("Made with Natural Earth")
    expect(html).not.toContain("M02")
    expect(html).not.toContain("M03")
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
    expect(html).not.toContain("2026 PT")
    for (const href of hrefsIn(html)) {
      expect(href.startsWith("https://") || href.startsWith("/")).toBe(true)
    }
  })

  it("renders the stay-zone locator lazily with Natural Earth credit", () => {
    const html = render("stay-zones")

    expect(html).toContain(`alt="${STAY_ALT}"`)
    expect(html).toContain('data-locator="abu-dhabi-stay-zones"')
    expect(html).toContain("/images/maps/abu-dhabi-stay-zones-375.svg")
    expect(html).toContain("/images/maps/abu-dhabi-stay-zones-desktop.svg")
    expect(html).toContain('width="1200"')
    expect(html).toContain('height="1010"')
    expect(html).toContain('height="1070"')
    expect(html).toContain("aspect-[1200/1010]")
    expect(html).toContain("max-sm:aspect-[375/1070]")
    expect(html).toContain('loading="lazy"')
    expect(html.toLowerCase()).not.toContain("fetchpriority")
    expect(html).toContain(">Expand stay-zone map<")
    expect(html).toContain("Geographic locator, not navigation.")
    expect(html).toContain("Stay-zone key")
    expect(html).toContain("not all of Dubai")
    expect(html).toContain(
      'href="https://www.naturalearthdata.com/about/terms-of-use/"'
    )
    expect(html).toContain("Made with Natural Earth")
    expect(html).toContain(
      'href="https://www.openstreetmap.org/relation/13251311"'
    )
    expect(html).toContain(
      'href="https://www.openstreetmap.org/relation/13251334"'
    )
    expect(html).toContain(
      'href="https://www.openstreetmap.org/relation/11912728"'
    )
    expect(html).toContain(
      'href="https://www.openstreetmap.org/way/1012139061"'
    )
    expect(html).not.toContain("M02")
    expect(html).not.toContain("M03")
    expect(html).not.toContain("2026 PT")
  })
})

describe("published map files", () => {
  it("keeps internal ids, tool names, and paths out of the public SVGs", () => {
    const files = [
      "public/images/maps/yas-marina-seating-desktop.svg",
      "public/images/maps/yas-marina-seating-375.svg",
      "public/images/maps/abu-dhabi-stay-zones-desktop.svg",
      "public/images/maps/abu-dhabi-stay-zones-375.svg"
    ]
    for (const file of files) {
      const text = readFileSync(path.join(root, file), "utf8")
      expect(text, file).not.toMatch(/M0[0-9]|m0[23]-/)
      expect(text, file).not.toMatch(
        /handoff|spatial-v2|\/cursor\/|\/agent\/|inkscape|sodipodi/
      )
      expect(text, file).not.toContain("2026 PT")
      expect(text, file).toContain("OpenStreetMap contributors")
    }
  })
})
