import { describe, expect, it } from "vitest"
import {
  hasListingFilters,
  listingCardMatches,
  seriesTabs,
  type ListingCardData,
  type ListingFilterState
} from "./race-listing-filter"

const card: ListingCardData = {
  timing: "upcoming",
  seriesSlug: "f1",
  name: "Australian Grand Prix",
  circuitName: "Albert Park",
  country: "Australia",
  location: "Melbourne",
  month: "March"
}

const open: ListingFilterState = {
  timing: "upcoming",
  seriesSlug: null,
  search: "",
  availability: [],
  month: [],
  country: []
}

describe("race listing filter", () => {
  it("keeps series chips in first-seen order and treats a missing series as F1", () => {
    expect(
      seriesTabs([
        { series: { slug: "motogp", short_name: "MotoGP" } },
        { series: null },
        { series: { slug: "f1", short_name: "Formula 1" } },
        { series: { slug: "motogp", short_name: "MotoGP" } }
      ])
    ).toEqual([
      { slug: "motogp", shortName: "MotoGP" },
      // Map keeps insertion order and the last object for a repeated slug.
      { slug: "f1", shortName: "Formula 1" }
    ])
  })

  it("matches the calendar's search, month, country, series, and timing rules", () => {
    expect(listingCardMatches(card, open)).toBe(true)
    expect(listingCardMatches(card, { ...open, timing: "past" })).toBe(false)
    expect(listingCardMatches(card, { ...open, seriesSlug: "wec" })).toBe(false)
    expect(listingCardMatches(card, { ...open, seriesSlug: "f1" })).toBe(true)
    expect(listingCardMatches(card, { ...open, search: "ALBERT" })).toBe(true)
    expect(listingCardMatches(card, { ...open, search: "monaco" })).toBe(false)
    expect(listingCardMatches(card, { ...open, month: ["March"] })).toBe(true)
    expect(listingCardMatches(card, { ...open, month: ["April"] })).toBe(false)
    expect(listingCardMatches(card, { ...open, country: ["Australia"] })).toBe(
      true
    )
    expect(
      listingCardMatches(
        { ...card, country: "" },
        { ...open, country: ["Australia"] }
      )
    ).toBe(false)
    expect(
      listingCardMatches(card, { ...open, availability: ["available"] })
    ).toBe(false)
  })

  it("does not treat the series chip as a results-summary filter", () => {
    expect(hasListingFilters(open)).toBe(false)
    expect(hasListingFilters({ ...open, search: "melbourne" })).toBe(true)
    expect(hasListingFilters({ ...open, month: ["March"] })).toBe(true)
  })
})
