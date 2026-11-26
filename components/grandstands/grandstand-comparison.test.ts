import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"
import type { SelectGrandstand } from "@/db/schema/grandstands-schema"
import { GRANDSTAND_METHOD_NOTE } from "@/lib/grandstand-copy"
import { GrandstandComparison } from "./grandstand-comparison"

function stand(overrides: Partial<SelectGrandstand> = {}): SelectGrandstand {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    circuitId: "22222222-2222-4222-8222-222222222222",
    name: "Club Corner",
    slug: "club-corner",
    description: "Final-corner passing under a roof.",
    viewRating: 5,
    covered: true,
    hasBigScreen: true,
    priceTier: "premium",
    typicalPrice: null,
    priceCurrency: "GBP",
    bestFor: "Best overall — the finish",
    pros: ["Roofed"],
    cons: ["Premium pricing"],
    viewsOf: ["Club corner"],
    sunExposure: "shaded",
    imageUrl: null,
    createdAt: new Date("2026-01-01T00:00:00Z"),
    updatedAt: new Date("2026-06-15T00:00:00Z"),
    ...overrides
  }
}

function render(grandstands: SelectGrandstand[]): string {
  return renderToStaticMarkup(
    createElement(GrandstandComparison, {
      circuitName: "Silverstone Circuit",
      grandstands
    })
  )
}

describe("GrandstandComparison table", () => {
  it("renders a labelled table of the existing facts and a card link", () => {
    const html = render([
      stand(),
      stand({
        id: "33333333-3333-4333-8333-333333333333",
        name: "Copse",
        slug: "copse",
        covered: false,
        sunExposure: "afternoon",
        viewRating: 3,
        priceTier: "budget",
        bestFor: "Best for first-timers — the opening corner"
      })
    ])

    expect(html).toContain("<table")
    expect(html).toContain("<caption")
    expect(html).toContain("Grandstands at Silverstone Circuit")
    expect(html).toContain('scope="col"')
    expect(html).toContain('scope="row"')
    expect(html).toContain(">Name<")
    expect(html).toContain(">Cover<")
    expect(html).toContain(">View<")
    expect(html).toContain(">Price<")
    expect(html).toContain(">Best for<")
    expect(html).toContain("Covered, Shaded")
    expect(html).toContain("5/5")
    expect(html).toContain("Premium")
    expect(html).toContain("Best overall — the finish")
    expect(html).toContain("Uncovered, Afternoon sun")
    expect(html).toContain("Budget")
    expect(html).toContain('href="#grandstand-club-corner"')
    expect(html).toContain('href="#grandstand-copse"')
    expect(html).toContain('for="grandstand-filter-cover"')
    expect(html).toContain('for="grandstand-filter-price"')
    expect(html).toContain('for="grandstand-filter-best-for"')
    expect(html).toMatch(
      /for="grandstand-filter-best-for"[^>]*>\s*Best for\s*</
    )
    expect(html).toContain('aria-live="polite"')
    expect(html).toContain("Showing 2 of 2 grandstands.")
    expect(html).toContain(GRANDSTAND_METHOD_NOTE)
    expect(html).toContain("Final-corner passing under a roof.")
    expect(html).not.toMatch(/last checked/i)
    expect(html).not.toContain("2026-06-15")
    expect(html).not.toContain("updatedAt")
    expect(html).not.toMatch(/[£$€]/)
    expect(html).not.toContain("/go/")
    expect(html).not.toContain("/api/redirect/")
    expect(html).toContain("overflow-x-auto")
    expect(html).toContain("sticky")
  })
})
