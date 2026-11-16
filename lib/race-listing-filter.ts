import type { RaceTiming } from "@/lib/race-calendar-window"

export type SeriesTab = {
  slug: string
  shortName: string
}

const FALLBACK_SERIES_TAB: SeriesTab = {
  slug: "f1",
  shortName: "F1"
}

/**
 * Series chips in first-seen order. A race with no series row is F1, matching
 * the calendar that shipped before the server listing.
 */
export function seriesTabs(
  races: readonly {
    series?: { slug: string; short_name: string } | null
  }[]
): SeriesTab[] {
  return Array.from(
    new Map(
      races.map(race => {
        const tab = race.series
          ? { slug: race.series.slug, shortName: race.series.short_name }
          : FALLBACK_SERIES_TAB
        return [tab.slug, tab] as const
      })
    ).values()
  )
}

export type ListingCardData = {
  timing: RaceTiming
  seriesSlug: string
  name: string
  circuitName: string
  country: string
  location: string
  month: string
}

export type ListingFilterState = {
  timing: RaceTiming
  seriesSlug: string | null
  search: string
  availability: readonly string[]
  month: readonly string[]
  country: readonly string[]
}

/** Search, availability, month, and country. Series and timing are separate. */
export function hasListingFilters(
  state: Pick<
    ListingFilterState,
    "search" | "availability" | "month" | "country"
  >
): boolean {
  return (
    Boolean(state.search) ||
    state.availability.length > 0 ||
    state.month.length > 0 ||
    state.country.length > 0
  )
}

/**
 * Same rules as the previous client calendar: availability selections match
 * nothing, search is a case-insensitive includes on name, circuit, country,
 * and location, and a missing country never satisfies a country filter.
 */
export function listingCardMatches(
  card: ListingCardData,
  state: ListingFilterState
): boolean {
  if (card.timing !== state.timing) return false
  if (state.seriesSlug && card.seriesSlug !== state.seriesSlug) return false

  const query = state.search.toLowerCase()
  if (query) {
    const terms = [
      card.name,
      card.circuitName,
      card.country,
      card.location
    ].filter(Boolean)
    const matchesSearch = terms.some(term => term.toLowerCase().includes(query))
    if (!matchesSearch) return false
  }

  if (state.availability.length > 0) return false

  if (state.month.length > 0 && !state.month.includes(card.month)) return false

  if (
    state.country.length > 0 &&
    (!card.country || !state.country.includes(card.country))
  ) {
    return false
  }

  return true
}
