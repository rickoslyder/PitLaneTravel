"use client"

import { RaceWithCircuit } from "@/types/database"

interface ResultsSummaryProps {
  /** The total number of races */
  totalRaces: number
  /** The number of races currently being shown */
  shownRaces: number
  /** The current view type */
  viewType: "grid" | "list"
  /** The current search query */
  searchQuery: string
  /** The current filters */
  filters: {
    availability: string[]
    month: string[]
    country: string[]
  }
}

export function ResultsSummary({
  totalRaces,
  shownRaces,
  viewType,
  searchQuery,
  filters
}: ResultsSummaryProps) {
  const hasFilters =
    searchQuery ||
    filters.availability.length > 0 ||
    filters.month.length > 0 ||
    filters.country.length > 0

  return (
    <div className="text-muted-foreground text-sm">
      {hasFilters ? (
        <p>
          Showing {shownRaces} of {totalRaces} races
          {searchQuery && <> matching &quot;{searchQuery}&quot;</>}
        </p>
      ) : (
        <p>
          {totalRaces} race{totalRaces !== 1 ? "s" : ""} available
        </p>
      )}
    </div>
  )
}
