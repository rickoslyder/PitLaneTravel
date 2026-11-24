import { formatBestFor, formatSunExposure } from "@/lib/grandstand-copy"

export type ComparableGrandstand = {
  slug: string
  name: string
  covered: boolean
  sunExposure: string | null
  viewRating: number | null
  priceTier: string | null
  bestFor: string | null
}

export type GrandstandFilters = {
  cover: string
  price: string
  bestFor: string
}

export const EMPTY_GRANDSTAND_FILTERS: GrandstandFilters = {
  cover: "",
  price: "",
  bestFor: ""
}

const SUN_FILTERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "shaded", label: "Shaded" },
  { value: "full", label: "Full sun" },
  { value: "morning", label: "Morning sun" },
  { value: "afternoon", label: "Afternoon sun" }
]

const PRICE_FILTERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "budget", label: "Budget" },
  { value: "mid", label: "Mid-range" },
  { value: "premium", label: "Premium" }
]

/** The comparable part of a best-for note, before the descriptive dash. */
export function bestForFilterLabel(value: string | null | undefined): string {
  const formatted = formatBestFor(value)
  if (!formatted) return ""
  const [head = ""] = formatted.split(/\s+[—–]\s+|\s+-\s+/)
  return head.trim()
}

function priceKey(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase()
}

export function grandstandMatchesFilters(
  grandstand: ComparableGrandstand,
  filters: GrandstandFilters
): boolean {
  if (filters.cover === "covered" && !grandstand.covered) return false
  if (filters.cover === "uncovered" && grandstand.covered) return false
  const sunFilter = SUN_FILTERS.find(option => option.value === filters.cover)
  if (
    sunFilter &&
    formatSunExposure(grandstand.sunExposure) !== sunFilter.label
  ) {
    return false
  }
  if (filters.price && priceKey(grandstand.priceTier) !== filters.price) {
    return false
  }
  if (
    filters.bestFor &&
    bestForFilterLabel(grandstand.bestFor) !== filters.bestFor
  ) {
    return false
  }
  return true
}

export function filterGrandstands<T extends ComparableGrandstand>(
  grandstands: readonly T[],
  filters: GrandstandFilters
): T[] {
  return grandstands.filter(grandstand =>
    grandstandMatchesFilters(grandstand, filters)
  )
}

export type FilterOption = {
  value: string
  label: string
}

function withAny(options: FilterOption[]): FilterOption[] {
  return [{ value: "", label: "Any" }, ...options]
}

export function coverFilterOptions(
  grandstands: readonly ComparableGrandstand[]
): FilterOption[] {
  const options: FilterOption[] = []
  if (grandstands.some(grandstand => grandstand.covered)) {
    options.push({ value: "covered", label: "Covered" })
  }
  if (grandstands.some(grandstand => !grandstand.covered)) {
    options.push({ value: "uncovered", label: "Uncovered" })
  }
  const suns = new Set(
    grandstands.map(grandstand => formatSunExposure(grandstand.sunExposure))
  )
  for (const sun of SUN_FILTERS) {
    if (suns.has(sun.label)) options.push(sun)
  }
  return withAny(options)
}

export function priceFilterOptions(
  grandstands: readonly ComparableGrandstand[]
): FilterOption[] {
  const present = new Set(
    grandstands.map(grandstand => priceKey(grandstand.priceTier))
  )
  return withAny(PRICE_FILTERS.filter(option => present.has(option.value)))
}

export function bestForFilterOptions(
  grandstands: readonly ComparableGrandstand[]
): FilterOption[] {
  const labels = new Set(
    grandstands
      .map(grandstand => bestForFilterLabel(grandstand.bestFor))
      .filter(Boolean)
  )
  return withAny(
    [...labels]
      .sort((a, b) => a.localeCompare(b))
      .map(label => ({ value: label, label }))
  )
}

export function comparisonCountLabel(shown: number, total: number): string {
  const noun = total === 1 ? "grandstand" : "grandstands"
  return `Showing ${shown} of ${total} ${noun}.`
}
