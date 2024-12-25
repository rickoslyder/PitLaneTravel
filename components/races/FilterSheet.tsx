"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { RaceWithCircuit } from "@/types/database"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface Filters {
  search: string
  availability: string[]
  month: string[]
  country: string[]
}

interface FilterSheetProps {
  /** Whether the filter sheet is open */
  open: boolean
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void
  /** List of races to filter */
  races: RaceWithCircuit[]
  /** Current filter options */
  filters: Filters
  /** Callback when a filter changes */
  onFilterChange: (field: keyof Filters, value: string[]) => void
  /** Callback to clear all filters */
  onClearFilters: () => void
}

interface FilterGroup {
  name: string
  field: keyof Filters
  options: { label: string; value: string }[]
}

export function FilterSheet({
  open,
  onOpenChange,
  races,
  filters,
  onFilterChange,
  onClearFilters
}: FilterSheetProps) {
  // Generate filter groups from races
  const filterGroups: FilterGroup[] = [
    {
      name: "Availability",
      field: "availability",
      options: [
        { label: "Available", value: "available" },
        { label: "Sold Out", value: "sold_out" },
        { label: "Coming Soon", value: "pending" }
      ]
    },
    {
      name: "Month",
      field: "month",
      options: Array.from(
        new Set(
          races.map(race =>
            new Date(race.date).toLocaleString("default", { month: "long" })
          )
        )
      )
        .sort((a, b) => {
          const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
          ]
          return months.indexOf(a) - months.indexOf(b)
        })
        .map(month => ({
          label: month,
          value: month
        }))
    },
    {
      name: "Country",
      field: "country",
      options: Array.from(new Set(races.map(race => race.country)))
        .sort()
        .map(country => ({
          label: country,
          value: country
        }))
    }
  ]

  const activeFilterCount = Object.entries(filters).reduce(
    (count, [key, value]) => {
      if (key === "search") return count
      return count + (value as string[]).length
    },
    0
  )

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-md"
        role="dialog"
        aria-label="Race filters"
      >
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                className="text-muted-foreground h-auto p-0"
                onClick={onClearFilters}
                aria-label="Clear all filters"
              >
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div
            className="space-y-4 pb-4"
            role="group"
            aria-label="Filter options"
          >
            {filterGroups.map(group => (
              <div
                key={group.name}
                className="space-y-3"
                role="group"
                aria-labelledby={`${group.name}-heading`}
              >
                <h4 id={`${group.name}-heading`} className="font-medium">
                  {group.name}
                </h4>
                <div className="space-y-2">
                  {group.options.map(option => {
                    const isChecked = filters[group.field].includes(
                      option.value
                    )
                    const checkboxId = `${group.name}-${option.value}`
                    return (
                      <div
                        key={option.value}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={checkboxId}
                            checked={isChecked}
                            onCheckedChange={checked => {
                              const newValues = checked
                                ? [...filters[group.field], option.value]
                                : (filters[group.field] as string[]).filter(
                                    (v: string) => v !== option.value
                                  )
                              onFilterChange(group.field, newValues)
                            }}
                          />
                          <Label
                            htmlFor={checkboxId}
                            className="text-sm font-normal"
                          >
                            {option.label}
                          </Label>
                        </div>
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {
                            races.filter(race => {
                              if (group.field === "month") {
                                return (
                                  new Date(race.date).toLocaleString(
                                    "default",
                                    { month: "long" }
                                  ) === option.value
                                )
                              }
                              if (group.field === "availability") {
                                return false // Availability not in RaceWithCircuit
                              }
                              return race.country === option.value
                            }).length
                          }
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        {activeFilterCount > 0 && (
          <div className="flex items-center gap-2 pt-4" aria-live="polite">
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              {activeFilterCount} active filter
              {activeFilterCount !== 1 ? "s" : ""}
            </Badge>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
