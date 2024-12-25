"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Filter, Search } from "lucide-react"

interface SearchBarProps {
  /** The current search query */
  searchQuery: string
  /** Callback when the search query changes */
  onSearchChange: (query: string) => void
  /** Callback when the filter button is clicked */
  onFilterClick: () => void
  /** The number of active filters */
  activeFilterCount: number
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  onFilterClick,
  activeFilterCount
}: SearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
        <Input
          type="search"
          placeholder="Search races..."
          className="pl-9"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={onFilterClick}
        className="relative"
        aria-label="Filter races"
      >
        <Filter className="size-4" />
        {activeFilterCount > 0 && (
          <Badge
            variant="secondary"
            className="absolute -right-2 -top-2 size-5 rounded-full p-0 text-xs"
          >
            {activeFilterCount}
          </Badge>
        )}
      </Button>
    </div>
  )
}
