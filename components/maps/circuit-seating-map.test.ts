import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import {
  CircuitSeatingMap,
  ExpandedSeatingArtwork
} from "@/components/maps/circuit-seating-map"
import { listCircuitSeatingMaps } from "@/data/circuit-seating-maps"
import {
  activeSlugForPin,
  isPinActive,
  pinPercent,
  resolvePinGrandstand,
  showCircuitSeatingMap
} from "@/data/circuit-seating-maps/match"
import { monzaSeatingMap } from "@/data/circuit-seating-maps/autodromo-nazionale-monza"
import { monacoSeatingMap } from "@/data/circuit-seating-maps/circuit-de-monaco"
import { silverstoneSeatingMap } from "@/data/circuit-seating-maps/silverstone-circuit"
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
    expect(maps.map(map => map.circuitSlug).sort()).toEqual([
      "autodromo-nazionale-monza",
      "circuit-de-monaco",
      "silverstone-circuit",
      "yas-marina-circuit"
    ])

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
        const previousName = pin.alsoNames?.[0]
        expect(pin.slug).toBe(slugify(previousName ?? pin.grandstandName))
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

  it("keeps Monaco north-up and pairs renamed stands with the earlier headings", () => {
    for (const file of [
      "public/images/maps/circuit-de-monaco-seating-desktop.svg",
      "public/images/maps/circuit-de-monaco-seating-375.svg"
    ]) {
      const text = readFileSync(path.join(root, file), "utf8")
      const sainte = text.match(/y="([\d.]+)"[^>]*>Sainte-Dévote/)
      const rascasse = text.match(/y="([\d.]+)"[^>]*>Rascasse/)
      expect(sainte, file).toBeTruthy()
      expect(rascasse, file).toBeTruthy()
      expect(Number(sainte?.[1])).toBeLessThan(Number(rascasse?.[1]))
    }

    const stands = [
      {
        slug: "grandstand-k-tabac-port-hercule",
        name: "Grandstand K (Tabac / Port Hercule)"
      },
      {
        slug: "grandstand-l-nouvelle-chicane",
        name: "Grandstand L (Nouvelle Chicane)"
      }
    ]
    const k = monacoSeatingMap.pins.find(pin => pin.label === "K")
    const l = monacoSeatingMap.pins.find(pin => pin.label === "L")
    expect(k?.slug).toBe("grandstand-k-tabac-port-hercule")
    expect(l?.slug).toBe("grandstand-l-nouvelle-chicane")
    expect(resolvePinGrandstand(k!, [stands[0]])?.slug).toBe(stands[0].slug)
    expect(resolvePinGrandstand(l!, [stands[1]])?.slug).toBe(stands[1].slug)
    expect(
      resolvePinGrandstand(k!, [{ slug: k!.slug, name: k!.grandstandName }])
        ?.slug
    ).toBe(k!.slug)
    expect(
      resolvePinGrandstand(l!, [{ slug: l!.slug, name: l!.grandstandName }])
        ?.slug
    ).toBe(l!.slug)
  })

  it("keeps corrected guide names on the existing grandstand slugs", () => {
    const seed = JSON.parse(
      readFileSync(path.join(root, "data/seeds/grandstands.json"), "utf8")
    ) as {
      circuits: Record<string, { name: string; slug?: string }[]>
    }
    const stable = [
      [
        "Circuit de Monaco",
        "Grandstand K (Quai Albert 1er)",
        "grandstand-k-tabac-port-hercule"
      ],
      [
        "Circuit de Monaco",
        "Grandstand L (Swimming Pool)",
        "grandstand-l-nouvelle-chicane"
      ],
      [
        "Autodromo Nazionale Monza",
        "Grandstands 18 and 20 (separate stands)",
        "grandstands-18-20-uscita-ascari"
      ],
      [
        "Las Vegas Strip Circuit",
        "Turn 3 Grandstand — Koval Zone (Turns 3-4, Koval Straight)",
        "turn-3-grandstand-east-harmon-zone-turns-3-4-koval-straight"
      ],
      [
        "Las Vegas Strip Circuit",
        "Lewis Hamilton Grandstand — Performance Zone (Turn 17, Harmon Straight)",
        "west-harmon-grandstand-west-harmon-zone-turns-14-17-area-harmon-straight"
      ]
    ] as const

    for (const [circuit, name, slug] of stable) {
      const row = seed.circuits[circuit].find(stand => stand.name === name)
      expect(row?.slug, name).toBe(slug)
      expect(slugify(name)).not.toBe(slug)
    }
  })

  it("matches the seeded Monaco, Silverstone and Monza names", () => {
    const seed = JSON.parse(
      readFileSync(path.join(root, "data/seeds/grandstands.json"), "utf8")
    ) as { circuits: Record<string, { name: string }[]> }
    const cases = [
      ["Circuit de Monaco", monacoSeatingMap],
      ["Silverstone Circuit", silverstoneSeatingMap],
      ["Autodromo Nazionale Monza", monzaSeatingMap]
    ] as const

    for (const [circuit, map] of cases) {
      const names = seed.circuits[circuit].map(stand => stand.name)
      for (const pin of map.pins) {
        expect(names, pin.grandstandName).toContain(pin.grandstandName)
      }
    }

    expect(silverstoneSeatingMap.pins.map(pin => pin.label)).toEqual([
      "1",
      "2",
      "3",
      "4"
    ])
    expect(
      silverstoneSeatingMap.pins.some(pin =>
        pin.grandstandName.includes("Lando")
      )
    ).toBe(false)
    expect(silverstoneSeatingMap.note).toContain("2025 official layout")
    expect(silverstoneSeatingMap.note).toContain("no single numbered point")
    expect(monzaSeatingMap.note).toContain("not marked")
    expect(monzaSeatingMap.pins.some(pin => pin.label === "18")).toBe(false)
    expect(monzaSeatingMap.pins.some(pin => pin.label === "19")).toBe(false)
    expect(monzaSeatingMap.pins.some(pin => pin.label === "20")).toBe(false)

    const yas = readFileSync(
      path.join(root, "public/images/maps/yas-marina-seating-desktop.svg"),
      "utf8"
    )
    expect(yas).toContain('fill="#08797e"')
    expect(yas).toContain('stroke="#486466"')
    expect(yas).not.toContain("#087e83")

    for (const file of [
      "public/images/maps/circuit-de-monaco-seating-desktop.svg",
      "public/images/maps/circuit-de-monaco-seating-375.svg",
      "public/images/maps/silverstone-seating-desktop.svg",
      "public/images/maps/silverstone-seating-375.svg",
      "public/images/maps/monza-seating-desktop.svg",
      "public/images/maps/monza-seating-375.svg"
    ]) {
      const text = readFileSync(path.join(root, file), "utf8")
      expect(text, file).toContain('stroke="#486466"')
      expect(text, file).not.toMatch(
        /handoff|\/cursor\/|\/agent\/|inkscape|sodipodi|qa-preview/
      )
    }
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

  it("disables pins for grandstands that are not in the current list", () => {
    const main = yasMarinaSeatingMap.pins[0]
    const html = renderToStaticMarkup(
      createElement(CircuitSeatingMap, {
        circuitName: "Yas Marina Circuit",
        circuitSlug: "yas-marina-circuit",
        map: yasMarinaSeatingMap,
        trackMapUrl: null,
        grandstands: [{ slug: main.slug, name: main.grandstandName }]
      })
    )
    const buttons = html
      .split("<button")
      .slice(1)
      .map(chunk => chunk.slice(0, chunk.indexOf(">")))
      .filter(chunk => chunk.includes("data-seating-pin="))

    expect(buttons).toHaveLength(6)
    const enabled = buttons.filter(
      chunk => !/(?:^|\s)disabled(?:=|\s|>|$)/.test(chunk)
    )
    expect(enabled).toHaveLength(1)
    expect(enabled[0]).toContain(`data-seating-pin="${main.slug}"`)
    expect(enabled[0]).toContain(`aria-controls="grandstand-${main.slug}"`)
    expect(
      buttons.filter(chunk => chunk.includes("aria-controls="))
    ).toHaveLength(1)
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
    expect(html).toContain('data-circuit-map="circuit"')
    expect(html).toContain('data-seating-pins="0"')
    expect(html).toContain('alt="Circuit map of Silverstone Circuit"')
    expect(html).toContain(
      "Circuit map of Silverstone Circuit. This shows the circuit layout, not a seating map."
    )
    expect(html).toContain(">Jump to a grandstand<")
    expect(html).toContain(">Club Corner (B/C)<")
    expect(html).toContain(">Woodcote<")
    expect(html).toContain(encodeURIComponent(TRACK_MAP))
    expect(html).toContain("aspect-[16/9]")
    expect(html).not.toContain("data-seating-pin=")
    expect(html).not.toContain("Expand seating map")
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
    expect(html.toLowerCase()).not.toContain("fetchpriority")
  })

  it("renders an empty state with no image when no map is available", () => {
    const html = renderToStaticMarkup(
      createElement(CircuitSeatingMap, {
        circuitName: "Circuit de Monaco",
        circuitSlug: "circuit-de-monaco",
        map: null,
        trackMapUrl: " ",
        grandstands: [{ slug: "tribune-t", name: "Tribune T" }]
      })
    )

    expect(html).toContain('data-circuit-map="empty"')
    expect(html).toContain("No circuit map for Circuit de Monaco.")
    expect(html).not.toMatch(/<img\b/)
    expect(html).not.toContain("data-seating-pin=")
    expect(html).not.toContain("seating map")
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
  })

  it("draws Monaco, Silverstone and Monza pins from separate desktop and mobile positions", () => {
    const maps = [monacoSeatingMap, silverstoneSeatingMap, monzaSeatingMap]
    for (const map of maps) {
      const html = renderToStaticMarkup(
        createElement(CircuitSeatingMap, {
          circuitName: map.circuitSlug,
          circuitSlug: map.circuitSlug,
          map,
          grandstands: map.pins.map(pin => ({
            slug: pin.slug,
            name: pin.grandstandName
          }))
        })
      )
      expect(html).toContain(`data-circuit-seating-map="${map.circuitSlug}"`)
      expect(html).toContain(`data-seating-pins="${map.pins.length}"`)
      expect(html).toContain(map.alt)
      expect(html).toContain(map.credit?.href)
      expect(html).toContain(map.credit?.label)
      expect(html).toContain("text-[#08797e]")
      expect(html).toContain('type="image/webp"')
      expect(html).toContain("--pin-d:")
      expect(html).toContain("--pin-d-mobile:")
      expect(html).not.toContain("/go/")
      expect(html).not.toContain("/api/redirect/")
      expect(html).not.toMatch(/\b(Scout|Grawk|Grok|Writer|Studio)\b/)
      for (const pin of map.pins) {
        expect(html).toContain(`data-seating-pin="${pin.slug}"`)
        expect(html).toContain(`aria-label="${pin.label}, ${pin.detail}"`)
      }
    }

    const monaco = renderToStaticMarkup(
      createElement(CircuitSeatingMap, {
        circuitName: "Circuit de Monaco",
        circuitSlug: "circuit-de-monaco",
        map: monacoSeatingMap,
        grandstands: []
      })
    )
    expect(monaco).toContain("North-up")
    expect(monaco).toContain("Piscine Rainier III")
    expect(monaco).toContain("not the Nouvelle Chicane")
  })

  it("draws desktop markers on the expanded seating artwork", () => {
    for (const map of [monacoSeatingMap, silverstoneSeatingMap, monzaSeatingMap]) {
      const html = renderToStaticMarkup(
        createElement(ExpandedSeatingArtwork, {
          map,
          grandstands: map.pins.map(pin => ({
            slug: pin.slug,
            name: pin.grandstandName
          }))
        })
      )
      expect(html).toContain('data-locator-art="expanded"')
      expect(html).toContain(`src="${map.art.desktop.svg}"`)
      expect(html.match(/data-pin-placement="expanded"/g)).toHaveLength(
        map.pins.length
      )
      expect(html).not.toContain("max-sm:left-[var(--pin-x-mobile)]")
      for (const pin of map.pins) {
        expect(html).toContain(`>${pin.label}<`)
        expect(html).toContain(
          `--pin-x:${pinPercent(pin.desktop.x, map.art.desktop.width)}`
        )
      }
    }
  })
})
