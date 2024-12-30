"use client"

import { useRef, useEffect, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { RaceWithCircuitAndSeries } from "@/types/database"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ScrollArea } from "@/components/ui/scroll-area"

if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
  console.error("Mapbox token is missing")
} else {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
}

interface WorldMapProps {
  races: RaceWithCircuitAndSeries[]
  onRaceSelect: (race: RaceWithCircuitAndSeries) => void
  className?: string
}

export function WorldMap({ races, onRaceSelect, className }: WorldMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<{ [key: string]: mapboxgl.Marker }>({})
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredRace, setHoveredRace] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20],
        zoom: 1.5,
        projection: "globe"
      })

      const nav = new mapboxgl.NavigationControl()
      map.current.addControl(nav, "top-right")

      map.current.on("style.load", () => {
        if (!map.current) return
        map.current.setFog({
          color: "rgb(186, 210, 235)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.02,
          "space-color": "rgb(11, 11, 25)",
          "star-intensity": 0.6
        })
      })

      map.current.on("load", () => {
        setIsLoaded(true)
      })

      return () => {
        if (map.current) {
          map.current.remove()
          map.current = null
        }
      }
    } catch (err) {
      console.error("Map initialization error:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize map")
    }
  }, [mapContainer.current])

  // Create markers
  useEffect(() => {
    const mapInstance = map.current
    if (!mapInstance || !isLoaded) return

    // Clear existing markers
    Object.values(markers.current).forEach(marker => marker.remove())
    markers.current = {}

    // Create markers for each race
    races.forEach(race => {
      if (!race.circuit?.longitude || !race.circuit?.latitude) return

      const popupContent = `
                <div class="p-4 min-w-[200px]">
                    <h3 class="font-semibold text-lg mb-2">${race.name}</h3>
                    <div class="space-y-2 text-sm text-muted-foreground">
                        <div class="flex items-center gap-2">
                            <span class="text-blue-500">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </span>
                            <span>${race.circuit.name}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-blue-500">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                            </span>
                            <span>${format(new Date(race.date), "MMM d, yyyy")}</span>
                        </div>
                        <div class="flex flex-wrap gap-2 mt-2">
                            ${race.is_sprint_weekend ? '<span class="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">Sprint Weekend</span>' : ""}
                            ${
                              race.supporting_series
                                ?.filter(
                                  series =>
                                    !(
                                      race.is_sprint_weekend &&
                                      series.series === "F1 Sprint"
                                    )
                                )
                                .map(
                                  series =>
                                    `<span class="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500 ring-1 ring-inset ring-blue-500/20">${series.series}</span>`
                                )
                                .join("") || ""
                            }
                        </div>
                    </div>
                    <button 
                        onclick="window.dispatchEvent(new CustomEvent('select-race', { detail: '${race.id}' }))"
                        class="mt-4 inline-flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    >
                        View Race Details
                    </button>
                </div>
            `

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "rounded-lg shadow-lg"
      }).setHTML(popupContent)

      const marker = new mapboxgl.Marker({
        color: "#E10600"
      })
        .setLngLat([race.circuit.longitude, race.circuit.latitude])
        .setPopup(popup)
        .addTo(mapInstance)

      // Add hover event listeners to marker element
      const element = marker.getElement()
      element.addEventListener("mouseenter", () => setHoveredRace(race.id))
      element.addEventListener("mouseleave", () => setHoveredRace(null))

      markers.current[race.id] = marker
    })

    // Handle race selection from popup buttons
    const handleRaceSelect = (e: CustomEvent<string>) => {
      const race = races.find(r => r.id === e.detail)
      if (race) {
        onRaceSelect(race)
      }
    }

    window.addEventListener("select-race", handleRaceSelect as EventListener)
    return () => {
      window.removeEventListener(
        "select-race",
        handleRaceSelect as EventListener
      )
      Object.values(markers.current).forEach(marker => marker.remove())
      markers.current = {}
    }
  }, [races, onRaceSelect, isLoaded])

  // Update marker colors on hover
  useEffect(() => {
    Object.entries(markers.current).forEach(([raceId, marker]) => {
      const element = marker.getElement()
      element.style.setProperty(
        "filter",
        hoveredRace === raceId ? "hue-rotate(85deg) saturate(1.5)" : "none"
      )
    })
  }, [hoveredRace])

  // Function to center map on a race
  const centerOnRace = (race: RaceWithCircuitAndSeries) => {
    if (!map.current || !race.circuit?.longitude || !race.circuit?.latitude)
      return

    map.current.flyTo({
      center: [race.circuit.longitude, race.circuit.latitude],
      zoom: 5,
      duration: 2000
    })

    markers.current[race.id]?.togglePopup()
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg", className)}>
      {/* Race List */}
      <div className="bg-background/95 absolute inset-y-4 left-4 z-20 w-80 rounded-lg border shadow-lg backdrop-blur-sm">
        <ScrollArea className="h-full">
          <div className="space-y-2 p-4">
            {races.map(race => (
              <button
                key={race.id}
                onClick={() => centerOnRace(race)}
                onMouseEnter={() => setHoveredRace(race.id)}
                onMouseLeave={() => setHoveredRace(null)}
                className={cn(
                  "w-full rounded-md px-4 py-3 text-left transition-colors",
                  "hover:bg-accent hover:text-accent-foreground",
                  hoveredRace === race.id &&
                    "bg-primary text-primary-foreground"
                )}
              >
                <div className="font-medium">{race.name}</div>
                <div className="text-muted-foreground text-sm">
                  {format(new Date(race.date), "MMM d, yyyy")}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div ref={mapContainer} className="size-full" />

      {error ? (
        <div className="bg-background/80 absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm">
          <p className="text-destructive">Error: {error}</p>
        </div>
      ) : (
        !isLoaded && (
          <div className="bg-background/80 absolute inset-0 z-30 flex items-center justify-center backdrop-blur-sm">
            <p className="text-muted-foreground">Loading map...</p>
          </div>
        )
      )}

      <div className="absolute bottom-4 right-4 z-20">
        <Badge
          variant="secondary"
          className="bg-background/95 backdrop-blur-sm"
        >
          {races.length} Races
        </Badge>
      </div>
    </div>
  )
}
