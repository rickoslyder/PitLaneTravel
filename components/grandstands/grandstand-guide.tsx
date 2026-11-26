"use client"

import { useMemo, useState } from "react"
import { CircuitFansSay } from "@/components/grandstands/circuit-fans-say"
import { GrandstandComparison } from "@/components/grandstands/grandstand-comparison"
import { CircuitSeatingMap } from "@/components/maps/circuit-seating-map"
import type { CircuitFanNote } from "@/content/grandstand-fan-notes"
import type { CircuitSeatingMapConfig } from "@/data/circuit-seating-maps/types"
import type { SelectGrandstand } from "@/db/schema/grandstands-schema"
import {
  EMPTY_GRANDSTAND_FILTERS,
  filterGrandstands,
  type GrandstandFilters
} from "@/lib/grandstand-comparison"

export function GrandstandGuide({
  circuitName,
  circuitSlug,
  map,
  trackMapUrl,
  grandstands,
  fanNotes = null
}: {
  circuitName: string
  circuitSlug: string
  map: CircuitSeatingMapConfig | null
  trackMapUrl?: string | null
  grandstands: SelectGrandstand[]
  fanNotes?: readonly CircuitFanNote[] | null
}) {
  const [filters, setFilters] = useState<GrandstandFilters>(
    EMPTY_GRANDSTAND_FILTERS
  )
  const visible = useMemo(
    () => filterGrandstands(grandstands, filters),
    [grandstands, filters]
  )

  return (
    <>
      <CircuitSeatingMap
        circuitName={circuitName}
        circuitSlug={circuitSlug}
        map={map}
        trackMapUrl={trackMapUrl}
        grandstands={visible.map(grandstand => ({
          slug: grandstand.slug,
          name: grandstand.name
        }))}
      />
      {fanNotes && fanNotes.length > 0 ? (
        <CircuitFansSay notes={fanNotes} />
      ) : null}
      <GrandstandComparison
        circuitName={circuitName}
        circuitSlug={circuitSlug}
        grandstands={grandstands}
        filters={filters}
        onFiltersChange={setFilters}
      />
    </>
  )
}
