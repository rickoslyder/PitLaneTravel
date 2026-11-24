import { describe, expect, it } from "vitest"
import {
  bestForFilterLabel,
  bestForFilterOptions,
  comparisonCountLabel,
  coverFilterOptions,
  filterGrandstands,
  priceFilterOptions,
  type ComparableGrandstand
} from "./grandstand-comparison"

function stand(
  overrides: Partial<ComparableGrandstand> & Pick<ComparableGrandstand, "slug">
): ComparableGrandstand {
  return {
    name: overrides.slug,
    covered: false,
    sunExposure: null,
    viewRating: 3,
    priceTier: "mid",
    bestFor: "Best value — a wide view",
    ...overrides
  }
}

const stands = [
  stand({
    slug: "club",
    name: "Club",
    covered: true,
    sunExposure: "shaded",
    viewRating: 5,
    priceTier: "premium",
    bestFor: "Best overall — the finish"
  }),
  stand({
    slug: "becketts",
    name: "Becketts",
    covered: false,
    sunExposure: "full",
    viewRating: 4,
    priceTier: "mid",
    bestFor: "Best value — the esses"
  }),
  stand({
    slug: "copse",
    name: "Copse",
    covered: false,
    sunExposure: "afternoon",
    viewRating: 3,
    priceTier: "budget",
    bestFor: "Best for first-timers — the opening corner"
  })
]

describe("grandstand comparison filters", () => {
  it("keeps the best-for label before the dash", () => {
    expect(bestForFilterLabel("Best overall — the finish")).toBe("Best overall")
    expect(bestForFilterLabel("Best for first-timers — Turn 1")).toBe(
      "Best for first-timers"
    )
    expect(bestForFilterLabel("first-timers")).toBe("Best for first-timers")
    expect(bestForFilterLabel("")).toBe("")
  })

  it("filters by cover, shade, price band and best for together", () => {
    expect(
      filterGrandstands(stands, {
        cover: "covered",
        price: "",
        bestFor: ""
      }).map(item => item.slug)
    ).toEqual(["club"])
    expect(
      filterGrandstands(stands, {
        cover: "shaded",
        price: "",
        bestFor: ""
      }).map(item => item.slug)
    ).toEqual(["club"])
    expect(
      filterGrandstands(stands, {
        cover: "uncovered",
        price: "budget",
        bestFor: ""
      }).map(item => item.slug)
    ).toEqual(["copse"])
    expect(
      filterGrandstands(stands, {
        cover: "full",
        price: "mid",
        bestFor: "Best value"
      }).map(item => item.slug)
    ).toEqual(["becketts"])
    expect(
      filterGrandstands(stands, {
        cover: "covered",
        price: "budget",
        bestFor: ""
      })
    ).toEqual([])
  })

  it("offers only the cover, price and best-for values on this page", () => {
    expect(coverFilterOptions(stands).map(option => option.label)).toEqual([
      "Any",
      "Covered",
      "Uncovered",
      "Shaded",
      "Full sun",
      "Afternoon sun"
    ])
    expect(priceFilterOptions(stands).map(option => option.label)).toEqual([
      "Any",
      "Budget",
      "Mid-range",
      "Premium"
    ])
    expect(bestForFilterOptions(stands).map(option => option.value)).toEqual([
      "",
      "Best for first-timers",
      "Best overall",
      "Best value"
    ])
  })

  it("announces how many grandstands remain", () => {
    expect(comparisonCountLabel(3, 7)).toBe("Showing 3 of 7 grandstands.")
    expect(comparisonCountLabel(1, 1)).toBe("Showing 1 of 1 grandstand.")
    expect(comparisonCountLabel(0, 5)).toBe("Showing 0 of 5 grandstands.")
  })
})
