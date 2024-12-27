"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown, Plane, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover"

interface DuffelAirport {
  code: string
  name: string
  city?: string
  timeZone: string | null
}

interface AirportSearchProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const MAX_RECENT_AIRPORTS = 5

export function AirportSearch({
  value,
  onValueChange,
  placeholder = "Search airports...",
  disabled = false
}: AirportSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [airports, setAirports] = useState<DuffelAirport[]>([])
  const [recentAirports, setRecentAirports] = useState<DuffelAirport[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load recent airports from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentAirports")
      if (stored) {
        setRecentAirports(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Error loading recent airports:", error)
    }
  }, [])

  // Load popular airports when dropdown opens
  useEffect(() => {
    if (open && !searchQuery && airports.length === 0) {
      fetchAirports("")
    }
  }, [open])

  const fetchAirports = async (query: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/flights/airports/search?${query ? `query=${encodeURIComponent(query)}` : ""}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to search airports")
      }

      if (data.success) {
        setAirports(data.airports)
      } else {
        throw new Error(data.message || "Failed to search airports")
      }
    } catch (error) {
      console.error("Error searching airports:", error)
      setError(
        error instanceof Error ? error.message : "Failed to search airports"
      )
      setAirports([])
    } finally {
      setLoading(false)
    }
  }

  // Handle search query changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    if (value.length >= 2) {
      fetchAirports(value)
    } else if (!value) {
      fetchAirports("")
    } else {
      setAirports([])
    }
  }

  // Save recent airports to localStorage
  const updateRecentAirports = (airport: DuffelAirport) => {
    try {
      const updated = [
        airport,
        ...recentAirports.filter(a => a.code !== airport.code)
      ].slice(0, MAX_RECENT_AIRPORTS)
      setRecentAirports(updated)
      localStorage.setItem("recentAirports", JSON.stringify(updated))
    } catch (error) {
      console.error("Error saving recent airports:", error)
    }
  }

  const handleSelect = (airport: DuffelAirport) => {
    onValueChange(airport.code)
    updateRecentAirports(airport)
    setOpen(false)
  }

  const formatAirportDisplay = (airport: DuffelAirport) => (
    <div className="flex items-center space-x-2">
      <div className="shrink-0">
        <Plane className="text-muted-foreground size-4" />
      </div>
      <div className="flex flex-col">
        <div className="font-medium">{airport.code}</div>
        <div className="text-muted-foreground truncate text-sm">
          {airport.name}
          {airport.city && ` • ${airport.city}`}
        </div>
      </div>
    </div>
  )

  const selectedAirport =
    airports.find(airport => airport.code === value) ||
    recentAirports.find(airport => airport.code === value)

  // Create unique identifiers for each airport
  const getAirportKey = (airport: DuffelAirport, type: "recent" | "search") => {
    const randomSuffix = Math.random().toString(36).substring(7)
    const baseKey = `${type}-${airport.code}-${randomSuffix}`
    return baseKey
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedAirport ? (
            <div className="flex items-center space-x-2">
              <Plane className="text-muted-foreground size-4" />
              <span>
                {selectedAirport.name} ({selectedAirport.code})
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search by airport name, city, or code..."
            value={searchQuery}
            onValueChange={handleSearchChange}
          />
          <div className="max-h-[300px] overflow-auto">
            {loading && (
              <div className="text-muted-foreground flex items-center justify-center p-4 text-sm">
                <Loader2 className="mr-2 size-4 animate-spin" />
                Searching airports...
              </div>
            )}
            <CommandEmpty>
              {error ? (
                <div className="p-4 text-sm text-red-500">{error}</div>
              ) : loading ? null : (
                <div className="text-muted-foreground p-4 text-sm">
                  No airports found. Try searching for a different name or code.
                </div>
              )}
            </CommandEmpty>
            {!searchQuery && recentAirports.length > 0 && (
              <CommandGroup heading="Recently Used">
                {recentAirports.map(airport => (
                  <CommandItem
                    key={getAirportKey(airport, "recent")}
                    value={`${airport.code} ${airport.name} ${airport.city || ""}`}
                    onSelect={() => handleSelect(airport)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === airport.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {formatAirportDisplay(airport)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {airports.length > 0 && (
              <CommandGroup heading="Search Results">
                {airports.map(airport => (
                  <CommandItem
                    key={getAirportKey(airport, "search")}
                    value={`${airport.code} ${airport.name} ${airport.city || ""}`}
                    onSelect={() => handleSelect(airport)}
                  >
                    <Check
                      className={cn(
                        "mr-2 size-4",
                        value === airport.code ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {formatAirportDisplay(airport)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
