"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { calculateDistance } from "@/lib/utils"
import { SelectLocalAttraction, SelectCircuitLocation } from "@/db/schema"
import {
  createLocalAttractionAction,
  getLocalAttractionsAction,
  searchNearbyPlacesAction
} from "@/actions/db/local-attractions-actions"
import { getCityLocationAction } from "@/actions/db/circuit-locations-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Clock, DollarSign, Info } from "lucide-react"

interface LocalAttractionsProps {
  circuit: {
    id: string
    name: string
    latitude: string
    longitude: string
  }
}

export default function LocalAttractions({ circuit }: LocalAttractionsProps) {
  const [attractions, setAttractions] = useState<SelectLocalAttraction[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [cityCenter, setCityCenter] = useState<SelectCircuitLocation | null>(
    null
  )
  const [debug, setDebug] = useState(false)

  useEffect(() => {
    loadAttractions()
    loadCityCenter()
  }, [circuit.id])

  async function loadAttractions() {
    console.log(
      "[LocalAttractions] Loading attractions for circuit:",
      circuit.id
    )
    const result = await getLocalAttractionsAction(circuit.id)
    if (result.isSuccess) {
      console.log("[LocalAttractions] Loaded attractions:", result.data)
      setAttractions(result.data)
    } else {
      console.error(
        "[LocalAttractions] Failed to load attractions:",
        result.message
      )
      toast.error(result.message)
    }
    setLoading(false)
  }

  async function loadCityCenter() {
    console.log(
      "[LocalAttractions] Loading city center for circuit:",
      circuit.id
    )
    const result = await getCityLocationAction(circuit.id)
    if (result.isSuccess && result.data) {
      console.log("[LocalAttractions] Loaded city center:", result.data)
      setCityCenter(result.data)
    } else {
      console.warn(
        "[LocalAttractions] No city center found or error:",
        result.message
      )
    }
  }

  function formatDistance(distance: string | null | undefined): string {
    if (!distance) return "Distance unknown"
    return `${Number(distance).toFixed(2)}km`
  }

  function formatDuration(duration: string | null | undefined): string {
    if (!duration) return "Duration not specified"
    return duration
  }

  async function syncWithGooglePlaces() {
    setSyncing(true)
    try {
      // Define relevant place types for F1 fans
      const placeTypes = ["tourist_attraction"] as const

      const existingAttractions = await getLocalAttractionsAction(circuit.id)
      const existingNames = new Set(
        existingAttractions.isSuccess
          ? existingAttractions.data.map(a => a.name)
          : []
      )

      // Search for each place type
      for (const type of placeTypes) {
        const placesResult = await searchNearbyPlacesAction(
          Number(circuit.latitude),
          Number(circuit.longitude),
          5000, // 5km radius
          type
        )

        if (!placesResult.isSuccess || !placesResult.data) {
          toast.error(`Failed to fetch ${type} places`)
          continue
        }

        // Filter and create attractions
        for (const place of placesResult.data) {
          // Skip if missing essential data
          if (!place.geometry?.location || !place.name) continue

          // Skip if already exists
          if (existingNames.has(place.name)) continue

          // Calculate distances
          const distanceFromCircuit = calculateDistance(
            Number(circuit.latitude),
            Number(circuit.longitude),
            Number(place.geometry.location.lat),
            Number(place.geometry.location.lng)
          )

          // Calculate distance from city center if available
          let distanceFromCity: number | undefined
          if (cityCenter) {
            distanceFromCity = calculateDistance(
              Number(cityCenter.latitude),
              Number(cityCenter.longitude),
              Number(place.geometry.location.lat),
              Number(place.geometry.location.lng)
            )
          }

          // Skip if too far from both circuit and city (over 5km)
          if (
            distanceFromCircuit > 5 &&
            (!distanceFromCity || distanceFromCity > 5)
          )
            continue

          // Skip if rating is too low
          if (place.rating && place.rating < 4.0) continue

          // Determine F1 relevance based on keywords
          const f1Keywords = [
            "f1",
            "formula",
            "racing",
            "motorsport",
            "grand prix",
            "race"
          ]
          const hasF1Relevance = f1Keywords.some(
            keyword =>
              place.name?.toLowerCase().includes(keyword) ||
              place.vicinity?.toLowerCase().includes(keyword)
          )

          await createLocalAttractionAction({
            circuitId: circuit.id,
            name: place.name,
            description: place.vicinity || place.name,
            latitude: String(place.geometry.location.lat),
            longitude: String(place.geometry.location.lng),
            distance_from_circuit: String(distanceFromCircuit),
            distance_from_city: distanceFromCity
              ? String(distanceFromCity)
              : undefined,
            price_range: place.price_level
              ? "$".repeat(place.price_level)
              : undefined,
            f1_relevance: hasF1Relevance ? "High" : undefined,
            estimated_duration: "1-2 hours",
            booking_required: place.business_status === "APPOINTMENT_ONLY"
          })

          existingNames.add(place.name)
        }
      }

      await loadAttractions()
      toast.success("Successfully synced with Google Places")
    } catch (error) {
      console.error("Error syncing with Google Places:", error)
      toast.error("Failed to sync with Google Places")
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">Local Attractions</h2>
          {cityCenter && (
            <p className="text-muted-foreground text-sm">
              City Center: {cityCenter.name} (
              {cityCenter.timezone || "Timezone unknown"})
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDebug(!debug)}
            title="Toggle debug info"
          >
            <Info className="size-4" />
          </Button>
          <Button onClick={syncWithGooglePlaces} disabled={syncing}>
            {syncing ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Sync with Google Places
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {attractions.map(attraction => (
          <Card key={attraction.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {attraction.name}
              </CardTitle>
              <CardDescription>
                {attraction.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <span>
                  {formatDistance(attraction.distance_from_circuit)} from
                  circuit
                  {attraction.distance_from_city &&
                    ` • ${formatDistance(attraction.distance_from_city)} from city`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-4" />
                <span>{formatDuration(attraction.estimated_duration)}</span>
              </div>
              {attraction.price_range && (
                <div className="flex items-center gap-2">
                  <DollarSign className="size-4" />
                  <span>{attraction.price_range}</span>
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {attraction.f1_relevance && (
                  <Badge variant="secondary">
                    F1 Relevance: {attraction.f1_relevance}
                  </Badge>
                )}
                {attraction.booking_required && (
                  <Badge variant="secondary">Booking Required</Badge>
                )}
              </div>
              {debug && (
                <div className="text-muted-foreground mt-4 space-y-1 text-xs">
                  <p>ID: {attraction.id}</p>
                  <p>
                    Lat: {attraction.latitude}, Lng: {attraction.longitude}
                  </p>
                  <p>
                    Created: {new Date(attraction.createdAt).toLocaleString()}
                  </p>
                  <p>
                    Updated: {new Date(attraction.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
