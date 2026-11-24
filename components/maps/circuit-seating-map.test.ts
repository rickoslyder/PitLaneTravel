import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { CircuitSeatingMap } from "@/components/maps/circuit-seating-map"
import { listCircuitSeatingMaps } from "@/data/circuit-seating-maps"
import {
  activeSlugForPin,
  isPinActive,
  pinPercent,
  resolvePinGrandstand,
  showCircuitSeatingMap
} from "@/data/circuit-seating-maps/match"
import { yasMarinaSeatingMap } from "@/data/circuit-seating-maps/yas-marina-circuit"
import { slugify } from "@/lib/series"

const root = process.cwd()

const TRACK_MAP =
  "https://vsszkzazjhvlecyryzon.supabase.co/storage/v1/object/public/circuit_maps/silverstone_circuit.png"

function circles(file: string) {
  const text = readFileSync(path.join(root, file), "utf8")
  return [...text.matchAll(/<circle cx="([\d.]+)" cy="([\d.]+)"/g)]
    .slice(0, 6)
    .map(match => ({ x: Number(match[1]), y: Number(match[2]) }))
}

describe("circuit seating map data", () => {
  it("registers Yas Marina and keeps every pin on its artwork", () => {
    const maps = listCircuitSeatingMaps()
    expect(maps.map(map => map.circuitSlug)).toContain("yas-marina-circuit")

    for (const map of maps) {
      expect(map.art.desktop.width).toBeGreaterThan(0)
      expect(map.art.mobile.height).toBeGreaterThan(0)
      const slugs = map.pins.map(pin => pin.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
      for (const pin of map.pins) {
        expect(pin.desktop.x).toBeGreaterThan(0)
        expect(pin.desktop.x).toBeLessThan(map.art.desktop.width)
        expect(pin.desktop.y).toBeGreaterThan(0)
        expect(pin.desktop.y).toBeLessThan(map.art.desktop.height)
        expect(pin.mobile.x).toBeGreaterThan(0)
        expect(pin.mobile.x).toBeLessThan(map.art.mobile.width)
        expect(pin.mobile.y).toBeGreaterThan(0)
        expect(pin.mobile.y).toBeLessThan(map.art.mobile.height)
        expect(pin.slug).toBe(slugify(pin.grandstandName))
      }
    }
  })

  it("uses the numbered circles on the Yas Marina artwork", () => {
    const desktop = circles("public/images/maps/yas-marina-seating-desktop.svg")
    const mobile = circles("public/images/maps/yas-marina-seating-375.svg")
    const svg = readFileSync(
      path.join(root, "public/images/maps/yas-marina-seating-desktop.svg"),
      "utf8"
    )
    const west = yasMarinaSeatingMap.pins.find(pin => pin.label === "West")

    expect(desktop).toHaveLength(6)
    expect(mobile).toHaveLength(6)
    yasMarinaSeatingMap.pins.forEach((pin, index) => {
      expect(pin.desktop.x).toBeCloseTo(desktop[index].x, 2)
      expect(pin.desktop.y).toBeCloseTo(desktop[index].y, 2)
      expect(pin.mobile.x).toBeCloseTo(mobile[index].x, 2)
      expect(pin.mobile.y).toBeCloseTo(mobile[index].y, 2)
    })
    expect(west?.detail.includes("6")).toBe(true)
    expect(west?.detail).toContain(svg.match(/Turns 6.7/)?.[0])
  })

  it("matches the seeded Yas Marina grandstand names", () => {
    const seed = JSON.parse(
      readFileSync(path.join(root, "data/seeds/grandstands.json"), "utf8")
    ) as { circuits: Record<string, { name: string }[]> }
    const names = seed.circuits["Yas Marina Circuit"].map(stand => stand.name)

    for (const pin of yasMarinaSeatingMap.pins) {
      expect(names).toContain(pin.grandstandName)
    }
  })

  it("matches a guide slug or the short name on the map key", () => {
    const main = yasMarinaSeatingMap.pins[0]
    const stands = [
      { slug: "main", name: "Main" },
      { slug: main.slug, name: main.grandstandName }
    ]

    expect(resolvePinGrandstand(main, [stands[0]])?.slug).toBe("main")
    expect(resolvePinGrandstand(main, [stands[1]])?.slug).toBe(main.slug)
    expect(activeSlugForPin(main, [stands[0]])).toBe("main")
    expect(isPinActive(main, "main", [stands[0]])).toBe(true)
    expect(isPinActive(main, "west", [stands[0]])).toBe(false)
    expect(pinPercent(394.9, 1200)).toBe("32.9083%")
  })

  it("shows a prepared map, or a track map, and skips a blank url", () => {
    expect(
      showCircuitSeatingMap({ map: yasMarinaSeatingMap, trackMapUrl: null })
    ).toBe(true)
    expect(showCircuitSeatingMap({ map: null, trackMapUrl: TRACK_MAP })).toBe(
      true
    )
    expect(showCircuitSeatingMap({ map: null, trackMapUrl: "  " })).toBe(false)
    expect(showCircuitSeatingMap({ map: null, trackMapUrl: null })).toBe(false)
  })
})

describe("CircuitSeatingMap", () => {
  it("renders Yas Marina pins over the existing locator", () => {
    const html = renderToStaticMarkup(
      createElement(CircuitSeatingMap, {
        circuitName: "Yas Marina Circuit",
        circuitSlug: "yas-marina-circuit",
        map: yasMarinaSeatingMap,
        trackMapUrl: TRACK_MAP,
        grandstands: yasMarinaSeatingMap.pins.map(pin => ({
          slug: pin.slug,
          name: pin.grandstandName
        }))
      })
    )

    expect(html).toContain('data-locator="yas-marina-seating"')
    expect(html).toContain('data-circuit-seating-map="yas-marina-circuit"')
    expect(html).toContain('data-seating-pins="6"')
    expect(html).toContain('loading="eager"')
    expect(html).toContain("aspect-[1200/960]")
    expect(html).toContain("max-sm:aspect-[375/1045]")
    expect(html).toContain("--pin-x:32.9083%")
    expect(html).toContain("--pin-x-mobile:49.9813%")
    expect(html).toContain('aria-label="1, Main, Start / finish"')
    expect(html).toContain(
      'aria-label="6, Abu Dhabi Hill, Approximate area, not an entrance"'
    )
    expect(html).toContain(">Expand seating map<")
    expect(html).not.toContain(TRACK_MAP)
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
    expect(html).not.toMatch(/\b(Scout|Grawk|Grok|Writer|Studio)\b/)
  })

  it("renders a track map with a grandstand list and no pins", () => {
    const html = renderToStaticMarkup(
      createElement(CircuitSeatingMap, {
        circuitName: "Silverstone Circuit",
        circuitSlug: "silverstone-circuit",
        map: null,
        trackMapUrl: `  ${TRACK_MAP}  `,
        grandstands: [
          { slug: "club-corner", name: "Club Corner (B/C)" },
          { slug: "woodcote", name: "Woodcote" }
        ]
      })
    )

    expect(html).toContain('data-circuit-seating-map="silverstone-circuit"')
    expect(html).toContain('data-seating-pins="0"')
    expect(html).toContain('alt="Silverstone Circuit track map"')
    expect(html).toContain("Grandstand positions are not marked on this map.")
    expect(html).toContain(">Club Corner (B/C)<")
    expect(html).toContain(">Woodcote<")
    expect(html).not.toContain("data-seating-pin=")
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
    expect(html.toLowerCase()).not.toContain("fetchpriority")
  })

  it("renders nothing without artwork or a track map", () => {
    const html = renderToStaticMarkup(
      createElement(CircuitSeatingMap, {
        circuitName: "Circuit de Monaco",
        circuitSlug: "circuit-de-monaco",
        map: null,
        trackMapUrl: " ",
        grandstands: [{ slug: "tribune-t", name: "Tribune T" }]
      })
    )

    expect(html).toBe("")
  })
})
