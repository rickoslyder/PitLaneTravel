"use client"

import { useEffect, useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
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
  timeZone: string
}

interface AirportSearchProps {
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

const MAX_RECENT_AIRPORTS = 5

export function AirportSearch({
  value,
  onValueChange,
  placeholder = "Search airports..."
}: AirportSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [airports, setAirports] = useState<DuffelAirport[]>([])
  const [recentAirports, setRecentAirports] = useState<DuffelAirport[]>([])
  const [loading, setLoading] = useState(false)

  // Load recent airports from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("recentAirports")
    if (stored) {
      setRecentAirports(JSON.parse(stored))
    }
  }, [])

  // Save recent airports to localStorage
  const updateRecentAirports = (airport: DuffelAirport) => {
    const updated = [
      airport,
      ...recentAirports.filter(a => a.code !== airport.code)
    ].slice(0, MAX_RECENT_AIRPORTS)
    setRecentAirports(updated)
    localStorage.setItem("recentAirports", JSON.stringify(updated))
  }

  useEffect(() => {
    const searchAirports = async () => {
      if (!searchQuery) {
        setAirports([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(
          `/api/flights/airports/search?query=${encodeURIComponent(searchQuery)}`
        )
        const data = await response.json()
        if (data.success) {
          setAirports(data.airports)
        }
      } catch (error) {
        console.error("Error searching airports:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounce = setTimeout(searchAirports, 300)
    return () => clearTimeout(debounce)
  }, [searchQuery])

  const handleSelect = (airport: DuffelAirport) => {
    onValueChange(airport.code)
    updateRecentAirports(airport)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? airports.find(airport => airport.code === value)?.name ||
              recentAirports.find(airport => airport.code === value)?.name ||
              value
            : placeholder}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput
            placeholder="Search airports..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandEmpty>
            {loading ? "Searching..." : "No airports found."}
          </CommandEmpty>
          {recentAirports.length > 0 && !searchQuery && (
            <CommandGroup heading="Recently Used">
              {recentAirports.map(airport => (
                <CommandItem
                  key={airport.code}
                  value={airport.code}
                  onSelect={() => handleSelect(airport)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === airport.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {airport.name} ({airport.code})
                  {airport.city && ` - ${airport.city}`}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {airports.length > 0 && (
            <CommandGroup heading="Search Results">
              {airports.map(airport => (
                <CommandItem
                  key={airport.code}
                  value={airport.code}
                  onSelect={() => handleSelect(airport)}
                >
                  <Check
                    className={cn(
                      "mr-2 size-4",
                      value === airport.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {airport.name} ({airport.code})
                  {airport.city && ` - ${airport.city}`}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  )
}
