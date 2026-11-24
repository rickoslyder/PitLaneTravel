import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { SelectGrandstand } from "@/db/schema/grandstands-schema"
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

describe("GrandstandCard public copy", () => {
  it("does not double Best for, and leaves the description as written", () => {
    const description = stand().description
    const html = render(stand())
    expect(html).toContain("Best overall — the harbour front")
    expect(html).not.toContain("Best for overall")
    expect(html).not.toContain("Best for Best")
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
    expect(html).not.toContain("Best for Best")
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

  it("shows the price-band legend without amounts", () => {
    const html = renderToStaticMarkup(createElement(GrandstandPriceLegend))
    expect(html).toContain("Budget, Mid-range and Premium")
    expect(html).toContain("not ticket prices")
    expect(html).not.toMatch(/[£$€]/)
  })
})
