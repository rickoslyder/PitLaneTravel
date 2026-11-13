import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import { CircuitFansSay } from "@/components/grandstands/circuit-fans-say"
import { GrandstandCard } from "@/components/grandstands/grandstand-card"
import {
  ABU_DHABI_CALENDAR_NOTE,
  F1_2026_CALENDAR_HREF,
  GRANDSTAND_FAN_NOTE_FOOTER,
  GRANDSTAND_FAN_NOTE_GAPS,
  PIT_LANE_NOTE_LABEL,
  QATAR_CALENDAR_NOTE,
  circuitFanNoteText,
  circuitFanNotes,
  fanLinesForStand,
  standLevelFanNotes,
  type CircuitFanNote
} from "@/content/grandstand-fan-notes"
import type { SelectGrandstand } from "@/db/schema/grandstands-schema"
import { slugify } from "@/lib/series"

const CONTENT_PATH = path.join(process.cwd(), "content/grandstand-fan-notes.ts")
const FAN_CIRCUITS = [
  "Silverstone Circuit",
  "Circuit Gilles Villeneuve",
  "Circuit de Spa-Francorchamps",
  "Yas Marina Circuit",
  "Lusail International Circuit"
] as const

const FORBIDDEN = [
  "1v1giqt",
  "automod_filtered",
  "gpticketshop",
  "abudhabi.gp",
  "abu_dhabi_gp_2025",
  "anpr",
  "f1 has confirmed",
  "f1 has said it is monitoring",
  "imola",
  "writer",
  "engineering lead",
  "scout",
  "grawk",
  "roadmap"
]

const LANDOSTAND =
  "One fan called it one of the best seats at the circuit for about £600, and said its price wasn't dynamic. The downside: it's on the opposite side from the coaches."
const GS1_GRILLE =
  "One fan said double-letter rows (AA, BB) are closest to the track, and single-letter rows sit higher, with a view over the grille and onto the track."
const NEAR_GS34 =
  "General admission: another first-timer found a big grassy patch near GS34 with a clear view at the fence."

function storedStands() {
  const seed = JSON.parse(
    readFileSync(
      path.join(process.cwd(), "data/seeds/grandstands.json"),
      "utf8"
    )
  ) as { circuits: Record<string, { name: string }[]> }
  return FAN_CIRCUITS.flatMap(name =>
    seed.circuits[name].map(stand => ({
      circuitSlug: slugify(name),
      standSlug: slugify(stand.name),
      name: stand.name
    }))
  )
}

function markup(element: ReturnType<typeof createElement>) {
  return renderToStaticMarkup(element)
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
}

function visibleText(html: string) {
  return html.replace(/<[^>]+>/g, "")
}

function stand(name: string): SelectGrandstand {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    circuitId: "00000000-0000-4000-8000-000000000002",
    name,
    slug: slugify(name),
    description: null,
    viewRating: null,
    covered: false,
    hasBigScreen: false,
    priceTier: null,
    typicalPrice: null,
    priceCurrency: "GBP",
    bestFor: null,
    pros: null,
    cons: null,
    viewsOf: null,
    sunExposure: null,
    imageUrl: null,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z")
  }
}

function assertClean(value: string) {
  const lower = value.toLowerCase()
  for (const marker of FORBIDDEN) {
    expect(lower, marker).not.toContain(marker)
  }
  expect(lower).not.toContain("silver 1")
}

describe("grandstand fan-note keys", () => {
  it("matches every stand-level key to a stored stand and leaves the three gaps blank", () => {
    const stored = storedStands()
    const storedKeys = new Set(
      stored.map(row => `${row.circuitSlug}/${row.standSlug}`)
    )
    const keyed = standLevelFanNotes()

    expect(keyed).toHaveLength(26)
    for (const row of keyed) {
      expect(
        storedKeys.has(`${row.circuitSlug}/${row.standSlug}`),
        `${row.circuitSlug}/${row.standSlug}`
      ).toBe(true)
      expect(row.lines.length).toBeGreaterThan(0)
    }

    const keyedSet = new Set(
      keyed.map(row => `${row.circuitSlug}/${row.standSlug}`)
    )
    expect(GRANDSTAND_FAN_NOTE_GAPS).toHaveLength(3)
    for (const gap of GRANDSTAND_FAN_NOTE_GAPS) {
      const key = `${gap.circuitSlug}/${gap.standSlug}`
      expect(storedKeys.has(key), key).toBe(true)
      expect(keyedSet.has(key), key).toBe(false)
      expect(fanLinesForStand(gap.circuitSlug, gap.standSlug)).toEqual([])
    }

    const covered = new Set([
      ...keyedSet,
      ...GRANDSTAND_FAN_NOTE_GAPS.map(
        gap => `${gap.circuitSlug}/${gap.standSlug}`
      )
    ])
    expect(covered.size).toBe(stored.length)
    for (const row of stored) {
      expect(covered.has(`${row.circuitSlug}/${row.standSlug}`)).toBe(true)
    }
  })

  it("keeps Silver 1 and the forbidden strings out of the committed copy", () => {
    const source = readFileSync(CONTENT_PATH, "utf8")
    const withoutOmissionComment = source.replace(
      "Spa Silver 1 was deliberately omitted.",
      ""
    )
    expect(source).toContain("Spa Silver 1 was deliberately omitted.")
    expect(withoutOmissionComment.toLowerCase()).not.toContain("silver 1")
    expect(source.toLowerCase()).not.toContain("1v1giqt")
    expect(source.toLowerCase()).not.toContain("automod_filtered")

    const lines = standLevelFanNotes().flatMap(row => row.lines)
    const notes = [
      "silverstone-circuit",
      "circuit-gilles-villeneuve",
      "circuit-de-spa-francorchamps",
      "yas-marina-circuit",
      "lusail-international-circuit"
    ].flatMap(slug => circuitFanNotes(slug) ?? [])
    const copy = [
      ...lines.map(line => `${line.text} ${line.sourceUrl}`),
      ...notes.map(note =>
        note.kind === "fan"
          ? `${note.text} ${note.sourceUrl}`
          : circuitFanNoteText(note)
      )
    ].join("\n")
    assertClean(copy)
    expect(copy).not.toMatch(/\/go\/|\/api\/redirect\//)
  })
})

describe("grandstand fan-note render", () => {
  it("renders stand-level lines with the year label and archived source link", () => {
    const lines = fanLinesForStand("silverstone-circuit", "landostand-stowe")
    const html = markup(
      createElement(GrandstandCard, {
        grandstand: stand("Landostand (Stowe)"),
        fanLines: lines
      })
    )
    const text = visibleText(html)
    expect(text).toContain(LANDOSTAND)
    expect(text).toContain("F1 fans, 2026")
    expect(text).toContain("Fans say")
    expect(html).toContain(
      'href="https://www.reddit.com/comments/1waka4w/_/p8iohh1/"'
    )
    expect(html).toContain(">archived Reddit copy<")
    expect(html).toContain('target="_blank"')
    expect(html).toContain('rel="noopener noreferrer"')

    const gs1 = visibleText(
      markup(
        createElement(GrandstandCard, {
          grandstand: stand("Grandstand 1 (Start-finish straight)"),
          fanLines: fanLinesForStand(
            "circuit-gilles-villeneuve",
            "grandstand-1-start-finish-straight"
          )
        })
      )
    )
    expect(gs1).toContain(GS1_GRILLE)
    expect(gs1).toContain("F1 fans, 2025")
    expect(gs1).not.toContain("fence")
  })

  it("renders circuit-level lines, the GS34 general-admission note, and the calendar sentences", () => {
    const montreal = circuitFanNotes("circuit-gilles-villeneuve")
    expect(montreal).not.toBeNull()
    const montrealHtml = markup(
      createElement(CircuitFansSay, { notes: montreal! })
    )
    const montrealText = visibleText(montrealHtml)
    expect(montrealText).toContain(NEAR_GS34)
    expect(montrealText).toContain("F1 fans, 2025")
    expect(montrealText).toContain(GRANDSTAND_FAN_NOTE_FOOTER)
    expect(montrealHtml).toContain('href="https://redd.it/1lcpjt9"')

    for (const [slug, sentence] of [
      ["yas-marina-circuit", ABU_DHABI_CALENDAR_NOTE],
      ["lusail-international-circuit", QATAR_CALENDAR_NOTE]
    ] as const) {
      const notes = circuitFanNotes(slug)
      expect(notes).not.toBeNull()
      const html = markup(createElement(CircuitFansSay, { notes: notes! }))
      const text = visibleText(html)
      expect(text).toContain(sentence)
      expect(text).toContain(`(${PIT_LANE_NOTE_LABEL})`)
      expect(text).toContain(
        "If you can, book refundable or flexible fares, and a hotel you can cancel for free."
      )
      expect(html).toContain(`href="${F1_2026_CALENDAR_HREF}"`)
      expect(html).toContain(`>${F1_2026_CALENDAR_HREF}<`)
      expect(text).not.toContain("F1 has confirmed")
      expect(text).not.toContain("F1 has said it is monitoring")
      assertClean(text)
    }

    expect(ABU_DHABI_CALENDAR_NOTE).toContain("Sunday 6 December")
    expect(ABU_DHABI_CALENDAR_NOTE).toContain("Round 23")
    expect(QATAR_CALENDAR_NOTE).toContain("Sunday 29 November")
    expect(QATAR_CALENDAR_NOTE).toContain("Round 22")
  })

  it("leaves Montreal GS34, Platine and Spa Combes without a Fans say block", () => {
    const blanks = [
      {
        circuitSlug: "circuit-gilles-villeneuve",
        name: "Grandstand 34 (hairpin — panoramic)"
      },
      {
        circuitSlug: "circuit-gilles-villeneuve",
        name: "Platine (Senna S, T1–2)"
      },
      {
        circuitSlug: "circuit-de-spa-francorchamps",
        name: "Combes (1-4)"
      }
    ]
    for (const blank of blanks) {
      const lines = fanLinesForStand(blank.circuitSlug, slugify(blank.name))
      expect(lines).toEqual([])
      const html = markup(
        createElement(GrandstandCard, {
          grandstand: stand(blank.name),
          fanLines: lines
        })
      )
      expect(html).not.toContain("Fans say")
      expect(html).not.toContain("data-fans-say")
      expect(visibleText(html)).not.toContain(NEAR_GS34)
      expect(visibleText(html)).not.toContain("archived Reddit copy")
      assertClean(visibleText(html))
    }
  })

  it("keeps the Spa 17-27 note as an age group, not a year", () => {
    const notes = circuitFanNotes("circuit-de-spa-francorchamps")
    const age = notes?.find(
      (note): note is Extract<CircuitFanNote, { kind: "fan" }> =>
        note.kind === "fan" && note.text.startsWith("17-27:")
    )
    expect(age?.year).toBe(2025)
    expect(age?.text).toContain("fans aged 17–27")
    const html = markup(createElement(CircuitFansSay, { notes: notes! }))
    const text = visibleText(html)
    expect(text).toContain('call it "Area 17-27"')
    expect(text).toContain("F1 fans, 2025")
    expect(text).not.toContain("F1 fans, 17")
    expect(text).not.toContain("F1 fans, 27")
  })

  it("does not render a circuit note for a circuit outside this set", () => {
    expect(circuitFanNotes("circuit-de-monaco")).toBeNull()
    expect(fanLinesForStand("circuit-de-monaco", "grandstand-k")).toEqual([])
  })
})
