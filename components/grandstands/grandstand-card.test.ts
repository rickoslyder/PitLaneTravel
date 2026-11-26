import { readFileSync } from "node:fs"
import path from "node:path"
import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { SelectGrandstand } from "@/db/schema/grandstands-schema"
import { formatBestFor } from "@/lib/grandstand-copy"
import { GrandstandCard, GrandstandPriceLegend } from "./grandstand-card"

function stand(overrides: Partial<SelectGrandstand> = {}): SelectGrandstand {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    circuitId: "22222222-2222-4222-8222-222222222222",
    name: "Grandstand K",
    slug: "grandstand-k",
    description:
      "Runs along the harbour front from Sainte-Dévote toward Tabac, giving the widest sweep of track of any Monaco stand.",
    viewRating: 4,
    covered: false,
    hasBigScreen: true,
    priceTier: "premium",
    typicalPrice: null,
    priceCurrency: "GBP",
    bestFor: "Best overall — the harbour front",
    pros: ["The widest sweep of track from any stand"],
    cons: ["Premium price"],
    viewsOf: ["Tabac"],
    sunExposure: "shaded",
    imageUrl: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides
  }
}

function render(grandstand: SelectGrandstand): string {
  return renderToStaticMarkup(createElement(GrandstandCard, { grandstand }))
}

function decode(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
}

/** Label and value of the best-for fact, in reading order. */
function bestForReading(html: string): string {
  const label = html.match(/data-fact="best-for"[^>]*>\s*([^<]*?)\s*</)
  const block = html.match(
    /data-fact="best-for"[\s\S]*?<dd[^>]*>([\s\S]*?)<\/dd>/
  )
  const raw = block?.[1] ?? ""
  const span = raw.match(/<span[^>]*>([\s\S]*?)<\/span>/)
  const value = decode((span?.[1] ?? raw).replace(/<[^>]+>/g, "")).trim()
  return `${label?.[1]?.trim() ?? ""} ${value}`.trim()
}

describe("GrandstandCard public copy", () => {
  it("does not double Best for, and leaves the description as written", () => {
    const description = stand().description
    const html = render(stand())
    expect(html).toContain("Best overall — the harbour front")
    expect(bestForReading(html)).toBe(
      "Highlight Best overall — the harbour front"
    )
    expect(html).not.toContain("Best for overall")
    expect(html).not.toContain("Best for Best")
    expect(bestForReading(html)).not.toMatch(/best for best/i)
    expect(html).toContain(description!)
    expect(html).toContain("Premium")
    expect(html).toContain("Shaded")
    expect(html).not.toMatch(/shaded sun/i)
    expect(html).not.toMatch(/[£$€]/)
  })

  it("renders first-timer, full sun and budget notes once", () => {
    const html = render(
      stand({
        bestFor: "Best for first-timers — Turn 1 & lap starts",
        sunExposure: "full",
        priceTier: "budget",
        covered: true
      })
    )
    expect(html).toContain("Best for first-timers — Turn 1 &amp; lap starts")
    expect(bestForReading(html)).toBe(
      "Highlight Best for first-timers — Turn 1 & lap starts"
    )
    expect(html).not.toContain("Best for Best")
    expect(bestForReading(html)).not.toMatch(/best for best/i)
    expect(html).toContain("Full sun")
    expect(html).toContain("Budget")
    expect(html).toContain("Covered")
  })

  it("leads with the name and a key-facts row", () => {
    const description = stand().description!
    const html = render(stand())
    const nameAt = html.indexOf(">Grandstand K<")
    const factsAt = html.indexOf('data-grandstand-facts="true"')
    const descriptionAt = html.indexOf(description)

    expect(nameAt).toBeGreaterThan(-1)
    expect(factsAt).toBeGreaterThan(nameAt)
    expect(descriptionAt).toBeGreaterThan(factsAt)
    expect(html).toContain('data-fact="cover"')
    expect(html).toContain("Uncovered, Shaded")
    expect(html).toContain('data-fact="view"')
    expect(html).toContain("4/5")
    expect(html).toContain('aria-label="4 out of 5"')
    expect(html).toContain('data-fact="price"')
    expect(html).toContain("Premium")
    expect(html).toContain('data-fact="best-for"')
    expect(html).toContain("Best overall — the harbour front")
    expect(html).toContain("Big screen")
    expect(html).toContain("Looks onto ")
    expect(html).toContain("Tabac")
    expect(html).toContain(description)
    expect(html).not.toContain("Best for Best")
    expect(html).not.toMatch(/<img\b/)
    expect(html).not.toMatch(/unsplash|placeholder|picsum|stock/i)
    expect(html).not.toMatch(/[£$€]/)
  })

  it("shows a photo only when the stand already has one", () => {
    const bare = render(stand({ imageUrl: "  " }))
    expect(bare).not.toMatch(/<img\b/)
    expect(bare).not.toContain("data-grandstand-photo")

    const photo = "https://example.com/stands/grandstand-k.jpg"
    const html = render(stand({ imageUrl: photo }))
    const factsAt = html.indexOf("data-grandstand-facts")
    const photoAt = html.indexOf("data-grandstand-photo")

    expect(photoAt).toBeGreaterThan(factsAt)
    expect(html).toContain("aspect-[16/9]")
    expect(html).toContain('alt="Grandstand K"')
    expect(html).toContain(encodeURIComponent(photo))
    expect(html).not.toMatch(/unsplash|placeholder|picsum/i)
  })

  it("does not read Best for Best when the note opens with Best views", () => {
    const note = "Best views of the harbour and the yacht club"
    const html = render(stand({ bestFor: note }))
    expect(bestForReading(html)).toBe(`Highlight ${note}`)
    expect(html).toContain(">Highlight<")
    expect(html).not.toMatch(/Best for Best views/)
    expect(bestForReading(html)).not.toMatch(/best for best/i)
  })

  it("keeps that label for every seeded grandstand", () => {
    const seed = JSON.parse(
      readFileSync(
        path.join(process.cwd(), "data/seeds/grandstands.json"),
        "utf8"
      )
    ) as {
      circuits: Record<string, { name: string; bestFor?: string | null }[]>
    }
    const circuits = [
      "Yas Marina Circuit",
      "Silverstone Circuit",
      "Circuit de Monaco",
      "Autodromo Nazionale Monza",
      "Madring"
    ]

    for (const circuit of circuits) {
      expect(seed.circuits[circuit]?.length).toBeGreaterThan(0)
    }

    for (const [circuit, grandstands] of Object.entries(seed.circuits)) {
      for (const grandstand of grandstands) {
        const html = render(
          stand({
            name: grandstand.name,
            slug: `${circuit}-${grandstand.name}`,
            bestFor: grandstand.bestFor ?? ""
          })
        )
        const reading = bestForReading(html)
        expect(reading, `${circuit} / ${grandstand.name}`).toBe(
          `Highlight ${formatBestFor(grandstand.bestFor)}`.trim()
        )
        expect(reading, `${circuit} / ${grandstand.name}`).not.toMatch(
          /best for best/i
        )
      }
    }
  })

  it("shows the price-band legend without amounts", () => {
    const html = renderToStaticMarkup(createElement(GrandstandPriceLegend))
    expect(html).toContain("Budget, Mid-range and Premium")
    expect(html).toContain("not ticket prices")
    expect(html).not.toMatch(/[£$€]/)
  })
})
