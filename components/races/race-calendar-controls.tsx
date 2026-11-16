"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { EmptyState } from "@/components/races/EmptyState"
import { ResultsSummary } from "@/components/races/ResultsSummary"
import { SearchBar } from "@/components/races/SearchBar"
import { ViewSwitcher } from "@/components/races/ViewSwitcher"
import {
  ListingCardView,
  type ListingCardModel
} from "@/components/races/race-listing-card-view"
import { revealListingPhotoFallback } from "@/components/races/race-listing-photo-fallback"
import {
  hasListingFilters,
  listingCardMatches,
  type ListingCardData,
  type ListingFilterState,
  type SeriesTab
} from "@/lib/race-listing-filter"
import type { RaceTiming } from "@/lib/race-calendar-window"
import type { RaceDateInput } from "@/lib/race-datetime"

const FilterSheet = dynamic(
  () => import("./FilterSheet").then(mod => mod.FilterSheet),
  { ssr: false }
)

type SlimRace = { date: RaceDateInput; country: string | null }

function cardFromElement(element: HTMLElement): ListingCardData {
  const timing: RaceTiming =
    element.dataset.raceTiming === "past" ? "past" : "upcoming"
  return {
    timing,
    seriesSlug: element.dataset.raceSeries ?? "f1",
    name: element.dataset.raceName ?? "",
    circuitName: element.dataset.raceCircuit ?? "",
    country: element.dataset.raceCountry ?? "",
    location: element.dataset.raceLocation ?? "",
    month: element.dataset.raceMonth ?? ""
  }
}

function slimRaces(root: ParentNode, timing: RaceTiming): SlimRace[] {
  const races: SlimRace[] = []
  root.querySelectorAll<HTMLElement>("[data-race-card]").forEach(card => {
    if (card.dataset.raceTiming !== timing) return
    const country = card.dataset.raceCountry
    races.push({
      date: card.dataset.raceDate ?? "",
      country: country ? country : null
    })
  })
  return races
}

export function RaceCalendarControls({
  series,
  upcomingCount,
  pastCount,
  pastCards,
  children
}: {
  series: readonly SeriesTab[]
  upcomingCount: number
  pastCount: number
  pastCards: readonly ListingCardModel[]
  children: React.ReactNode
}) {
  const router = useRouter()
  const resultsRef = useRef<HTMLDivElement>(null)
  const [timing, setTiming] = useState<RaceTiming>("upcoming")
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  const [seriesFilter, setSeriesFilter] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: "",
    availability: [] as string[],
    month: [] as string[],
    country: [] as string[]
  })
  const [shown, setShown] = useState(upcomingCount)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [sheetMounted, setSheetMounted] = useState(false)
  const [sheetRaces, setSheetRaces] = useState<SlimRace[]>([])

  const filterState: ListingFilterState = {
    timing,
    seriesSlug: seriesFilter,
    search: filters.search,
    availability: filters.availability,
    month: filters.month,
    country: filters.country
  }

  useEffect(() => {
    const onError = (event: Event) => revealListingPhotoFallback(event.target)
    document.addEventListener("error", onError, true)
    return () => document.removeEventListener("error", onError, true)
  }, [])

  useLayoutEffect(() => {
    const root = resultsRef.current
    if (!root) return
    let nextShown = 0
    root.querySelectorAll<HTMLElement>("[data-race-card]").forEach(card => {
      const match = listingCardMatches(cardFromElement(card), filterState)
      // Inline display wins over the list-view flex utility. The hidden
      // attribute does not, because that utility sets display.
      card.style.display = match ? "" : "none"
      if (match) nextShown += 1
    })
    setShown(current => (current === nextShown ? current : nextShown))
    // filterState is rebuilt from the values listed below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timing,
    seriesFilter,
    filters.search,
    filters.availability,
    filters.month,
    filters.country
  ])

  useLayoutEffect(() => {
    if (!sheetMounted) return
    const root = resultsRef.current
    if (!root) return
    setSheetRaces(slimRaces(root, timing))
  }, [sheetMounted, timing])

  const total = timing === "upcoming" ? upcomingCount : pastCount
  const summaryFilters = {
    availability: filters.availability,
    month: filters.month,
    country: filters.country
  }
  const filtered = hasListingFilters(filterState)
  const activeFilterCount =
    filters.availability.length + filters.month.length + filters.country.length

  const openFilters = useCallback(() => {
    const root = resultsRef.current
    if (root) setSheetRaces(slimRaces(root, timing))
    setSheetMounted(true)
    setIsFilterOpen(true)
  }, [timing])

  const clearFilters = useCallback(() => {
    setFilters({
      search: "",
      availability: [],
      month: [],
      country: []
    })
  }, [])

  return (
    <>
      <div
        className="mb-6 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Race timing"
      >
        {(
          [
            ["upcoming", "Upcoming"],
            ["past", "Past"]
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={timing === value}
            onClick={() => setTiming(value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              timing === value
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {series.length > 1 ? (
        <div
          className="mb-6 flex flex-wrap justify-center gap-2"
          data-races-series-filters=""
        >
          <button
            type="button"
            onClick={() => setSeriesFilter(null)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              seriesFilter === null
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background hover:bg-muted"
            }`}
          >
            All Series
          </button>
          {series.map(item => (
            <button
              key={item.slug}
              type="button"
              onClick={() =>
                setSeriesFilter(current =>
                  current === item.slug ? null : item.slug
                )
              }
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                seriesFilter === item.slug
                  ? "bg-foreground text-background border-transparent"
                  : "bg-background text-foreground hover:bg-muted"
              }`}
            >
              {item.shortName}
            </button>
          ))}
        </div>
      ) : null}

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchBar
            searchQuery={filters.search}
            onSearchChange={search =>
              setFilters(current => ({ ...current, search }))
            }
            onFilterClick={openFilters}
            activeFilterCount={activeFilterCount}
          />
          <ViewSwitcher viewType={viewType} onViewChange={setViewType} />
        </div>

        <ResultsSummary
          totalRaces={total}
          shownRaces={shown}
          viewType={viewType}
          searchQuery={filters.search}
          filters={summaryFilters}
        />

        <div
          ref={resultsRef}
          data-race-view={viewType}
          className={
            shown === 0
              ? "hidden"
              : viewType === "grid"
                ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
          }
          onClick={event => {
            const target = event.target
            if (!(target instanceof Element)) return
            if (target.closest("a, button")) return
            const card = target.closest("[data-race-href]")
            if (!(card instanceof HTMLElement)) return
            const href = card.dataset.raceHref
            if (href) router.push(href)
          }}
        >
          {children}
          {timing === "past"
            ? pastCards.map(model => (
                <ListingCardView key={model.id} model={model} />
              ))
            : null}
        </div>

        {shown === 0 ? (
          <EmptyState isFiltered={filtered} onClearFilters={clearFilters} />
        ) : null}
      </div>

      {sheetMounted ? (
        <FilterSheet
          open={isFilterOpen}
          onOpenChange={setIsFilterOpen}
          races={sheetRaces}
          filters={filters}
          onFilterChange={(field, value) =>
            setFilters(current => ({ ...current, [field]: value }))
          }
          onClearFilters={clearFilters}
        />
      ) : null}
    </>
  )
}
