"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Search } from "lucide-react"

interface EmptyStateProps {
  /** Whether the empty state is due to search/filters */
  isFiltered: boolean
  /** Callback to clear all filters */
  onClearFilters: () => void
}

export function EmptyState({ isFiltered, onClearFilters }: EmptyStateProps) {
  if (isFiltered) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
        <div className="bg-muted rounded-full p-3">
          <Search className="text-muted-foreground size-6" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold tracking-tight">No races found</h3>
          <p className="text-muted-foreground text-sm">
            No races match your search criteria. Try adjusting your filters.
          </p>
        </div>
        <Button onClick={onClearFilters} variant="outline">
          Clear filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4 text-center">
      <div className="bg-muted rounded-full p-3">
        <Calendar className="text-muted-foreground size-6" />
      </div>
      <div className="space-y-2">
        <h3 className="font-semibold tracking-tight">No races available</h3>
        <p className="text-muted-foreground text-sm">
          There are no races available at the moment. Please check back later.
        </p>
      </div>
    </div>
  )
}
