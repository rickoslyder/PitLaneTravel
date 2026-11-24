"use client"

import { useMemo, useState } from "react"
import { GrandstandCard } from "@/components/grandstands/grandstand-card"
import {
  focusGrandstand,
  GrandstandCardFrame,
  useSeatingSync
} from "@/components/maps/seating-sync"
import { grandstandAnchorId } from "@/data/circuit-seating-maps/match"
import type { SelectGrandstand } from "@/db/schema/grandstands-schema"
import {
  bestForFilterOptions,
  comparisonCountLabel,
  coverFilterOptions,
  EMPTY_GRANDSTAND_FILTERS,
  filterGrandstands,
  priceFilterOptions,
  type GrandstandFilters
} from "@/lib/grandstand-comparison"
import {
  formatBestFor,
  formatCoverSun,
  formatPriceTier,
  formatViewRating,
  GRANDSTAND_METHOD_NOTE
} from "@/lib/grandstand-copy"

function cell(value: string): string {
  return value || "—"
}

function FilterSelect({
  id,
  label,
  value,
  options,
  onChange
}: {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor={id}
        className="text-muted-foreground text-[0.6875rem] font-medium uppercase tracking-[0.08em]"
      >
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={event => onChange(event.target.value)}
        className="border-input bg-card text-foreground mt-1 h-11 w-full rounded-md border px-3 text-sm"
      >
        {options.map(option => (
          <option key={option.value || "any"} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export function GrandstandComparison({
  circuitName,
  grandstands
}: {
  circuitName: string
  grandstands: SelectGrandstand[]
}) {
  const sync = useSeatingSync()
  const [filters, setFilters] = useState<GrandstandFilters>(
    EMPTY_GRANDSTAND_FILTERS
  )
  const visible = useMemo(
    () => filterGrandstands(grandstands, filters),
    [grandstands, filters]
  )
  const coverOptions = useMemo(
    () => coverFilterOptions(grandstands),
    [grandstands]
  )
  const priceOptions = useMemo(
    () => priceFilterOptions(grandstands),
    [grandstands]
  )
  const bestForOptions = useMemo(
    () => bestForFilterOptions(grandstands),
    [grandstands]
  )

  function setFilter(key: keyof GrandstandFilters, value: string) {
    setFilters(current => ({ ...current, [key]: value }))
  }

  return (
    <section className="min-w-0 space-y-4" data-grandstand-comparison="">
      <p className="text-muted-foreground max-w-3xl text-sm leading-relaxed">
        {GRANDSTAND_METHOD_NOTE}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FilterSelect
          id="grandstand-filter-cover"
          label="Cover"
          value={filters.cover}
          options={coverOptions}
          onChange={value => setFilter("cover", value)}
        />
        <FilterSelect
          id="grandstand-filter-price"
          label="Price"
          value={filters.price}
          options={priceOptions}
          onChange={value => setFilter("price", value)}
        />
        <FilterSelect
          id="grandstand-filter-best-for"
          label="Best for"
          value={filters.bestFor}
          options={bestForOptions}
          onChange={value => setFilter("bestFor", value)}
        />
      </div>
      <p aria-live="polite" aria-atomic="true" data-comparison-count="">
        {comparisonCountLabel(visible.length, grandstands.length)}
      </p>
      <div className="bg-card max-w-full overflow-x-auto overscroll-x-contain rounded-lg border">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="text-foreground caption-top px-3 pb-3 text-left text-base font-semibold">
            Grandstands at {circuitName}
          </caption>
          <thead>
            <tr className="border-b">
              <th
                scope="col"
                className="bg-card sticky left-0 z-10 px-3 py-2 font-medium"
              >
                Name
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Cover
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                View
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Price
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Best for
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-muted-foreground px-3 py-4">
                  No grandstands match these filters.
                </td>
              </tr>
            ) : (
              visible.map(grandstand => {
                const active = sync?.activeSlug === grandstand.slug
                const sticky = active ? "bg-muted" : "bg-card"
                return (
                  <tr
                    key={grandstand.id}
                    data-active={active ? "true" : "false"}
                    className={`border-b last:border-b-0 ${active ? "bg-muted" : ""}`}
                  >
                    <th
                      scope="row"
                      className={`sticky left-0 z-10 p-3 text-left font-medium ${sticky}`}
                    >
                      <a
                        href={`#${grandstandAnchorId(grandstand.slug)}`}
                        className="text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e10600]"
                        onClick={event => {
                          sync?.selectSlug(grandstand.slug)
                          focusGrandstand(grandstand.slug)
                          event.preventDefault()
                        }}
                      >
                        {grandstand.name}
                      </a>
                    </th>
                    <td className="p-3">
                      {cell(
                        formatCoverSun(
                          grandstand.covered,
                          grandstand.sunExposure
                        )
                      )}
                    </td>
                    <td className="p-3">
                      {cell(formatViewRating(grandstand.viewRating))}
                    </td>
                    <td className="p-3">
                      {cell(formatPriceTier(grandstand.priceTier))}
                    </td>
                    <td className="max-w-xs p-3">
                      {cell(formatBestFor(grandstand.bestFor))}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map(grandstand => (
          <GrandstandCardFrame key={grandstand.id} slug={grandstand.slug}>
            <GrandstandCard grandstand={grandstand} />
          </GrandstandCardFrame>
        ))}
      </div>
    </section>
  )
}
