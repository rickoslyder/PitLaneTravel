"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { SearchBar } from "./SearchBar"
import { FilterSheet } from "./FilterSheet"
import { ResultsSummary } from "./ResultsSummary"
import { RaceGrid } from "./RaceGrid"
import { EmptyState } from "./EmptyState"
import { HeroSection } from "./HeroSection"
import { ViewSwitcher } from "./ViewSwitcher"

interface RacesPageProps {
  initialRaces: RaceWithCircuitAndSeries[]
}

export function RacesPage({ initialRaces }: RacesPageProps) {
  const router = useRouter()
  const [races] = useState<RaceWithCircuitAndSeries[]>(initialRaces)
  const [viewType, setViewType] = useState<"grid" | "list">("grid")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    availability: [] as string[],
    month: [] as string[],
    country: [] as string[]
  })

  const filteredRaces = races.filter(race => {
    const searchTerms = [
      race.name,
      race.circuit?.name,
      race.country,
      race.circuit?.location
    ].filter(Boolean) as string[]

    const matchesSearch =
      !filters.search ||
      searchTerms.some(term =>
        term.toLowerCase().includes(filters.search.toLowerCase())
      )

    const matchesAvailability = filters.availability.length === 0

    const matchesMonth =
      filters.month.length === 0 ||
      filters.month.includes(
        new Date(race.date).toLocaleString("default", { month: "long" })
      )

    const matchesCountry =
      filters.country.length === 0 ||
      (race.country && filters.country.includes(race.country))

    return (
      matchesSearch && matchesAvailability && matchesMonth && matchesCountry
    )
  })

  const handleSearchChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }))
  }, [])

  const handleFilterChange = useCallback(
    (field: keyof typeof filters, value: string[]) => {
      setFilters(prev => ({ ...prev, [field]: value }))
    },
    []
  )

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: "",
      availability: [],
      month: [],
      country: []
    })
  }, [])

  const handleRaceClick = useCallback(
    (race: RaceWithCircuitAndSeries) => {
      router.push(`/races/${race.slug || race.id}`)
    },
    [router]
  )

  const hasFilters =
    Boolean(filters.search) ||
    filters.availability.length > 0 ||
    filters.month.length > 0 ||
    filters.country.length > 0

  const activeFilterCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (key === "search") return count
      return count + (value as string[]).length
    },
    0
  )

  return (
    <div className="space-y-8">
      <div className="bg-background">
        <HeroSection />
      </div>

      <div className="bg-card mx-auto max-w-7xl rounded-lg p-6 shadow">
        <h1 className="mb-6 text-center text-2xl font-bold">
          F1 Race Calendar
        </h1>

        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchBar
              searchQuery={filters.search}
              onSearchChange={handleSearchChange}
              onFilterClick={() => setIsFilterOpen(true)}
              activeFilterCount={activeFilterCount}
            />
            <ViewSwitcher viewType={viewType} onViewChange={setViewType} />
          </div>

          <ResultsSummary
            totalRaces={races.length}
            shownRaces={filteredRaces.length}
            viewType={viewType}
            searchQuery={filters.search}
            filters={filters}
          />

          {filteredRaces.length > 0 ? (
            <RaceGrid
              races={filteredRaces}
              viewType={viewType}
              onRaceClick={handleRaceClick}
            />
          ) : (
            <EmptyState
              isFiltered={hasFilters}
              onClearFilters={handleClearFilters}
            />
          )}
        </div>
      </div>

      <FilterSheet
        open={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        races={races}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />
    </div>
  )
}
