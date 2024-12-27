"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { GeoJSON } from "geojson"

// Initialize Mapbox
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface Airport {
  name: string
  latitude: number
  longitude: number
  distance: number
  placeId?: string
  airportCode?: string
}

interface MapPreviewProps {
  circuitLatitude: number
  circuitLongitude: number
  radius: number
  airports: Airport[]
  onMapInitialized: () => void
}

export default function MapPreview({
  circuitLatitude,
  circuitLongitude,
  radius,
  airports,
  onMapInitialized
}: MapPreviewProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const radiusCircle = useRef<mapboxgl.GeoJSONSource | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [circuitLongitude, circuitLatitude],
      zoom: 9,
      attributionControl: false
    })

    map.current = newMap

    // Add navigation controls
    newMap.addControl(new mapboxgl.NavigationControl())

    // Wait for map to load before adding markers and layers
    newMap.on("load", () => {
      // Add circuit marker
      new mapboxgl.Marker({ color: "#3b82f6" })
        .setLngLat([circuitLongitude, circuitLatitude])
        .addTo(newMap)

      // Add a source for the radius circle
      newMap.addSource("radius", {
        type: "geojson",
        data: createGeoJSONCircle([circuitLongitude, circuitLatitude], radius)
      })

      // Add a layer for the radius circle
      newMap.addLayer({
        id: "radius-circle",
        type: "fill",
        source: "radius",
        paint: {
          "fill-color": "#3b82f6",
          "fill-opacity": 0.2
        }
      })

      // Store reference to the source
      radiusCircle.current = newMap.getSource(
        "radius"
      ) as mapboxgl.GeoJSONSource
      onMapInitialized()

      // Fit bounds to show the radius
      const bounds = new mapboxgl.LngLatBounds()
      const points = calculateBoundingBox(
        [circuitLongitude, circuitLatitude],
        radius
      )
      points.forEach(point => bounds.extend(point))
      newMap.fitBounds(bounds, { padding: 50 })
    })

    // Cleanup
    return () => {
      markers.current.forEach(marker => marker.remove())
      markers.current = []
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [circuitLatitude, circuitLongitude, radius, onMapInitialized])

  // Update markers when airports change
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Add new markers
    airports.forEach(airport => {
      const marker = new mapboxgl.Marker({ color: "#f59e0b" })
        .setLngLat([airport.longitude, airport.latitude])
        .setPopup(
          new mapboxgl.Popup().setHTML(
            `<strong>${airport.name}</strong>${airport.airportCode ? `<br>Code: ${airport.airportCode}` : ""}<br>${airport.distance}km away`
          )
        )
        .addTo(map.current!)

      markers.current.push(marker)
    })

    // Fit bounds if there are airports
    if (airports.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      airports.forEach(airport => {
        bounds.extend([airport.longitude, airport.latitude])
      })
      bounds.extend([circuitLongitude, circuitLatitude]) // Include circuit location
      map.current.fitBounds(bounds, { padding: 50 })
    }
  }, [airports, circuitLongitude, circuitLatitude])

  // Update radius circle when radius changes
  useEffect(() => {
    if (!map.current || !radiusCircle.current) return

    try {
      const circleData = createGeoJSONCircle(
        [circuitLongitude, circuitLatitude],
        radius
      )
      radiusCircle.current.setData(circleData)

      // Fit the map to show the entire radius
      const bounds = new mapboxgl.LngLatBounds()
      const points = calculateBoundingBox(
        [circuitLongitude, circuitLatitude],
        radius
      )
      points.forEach(point => bounds.extend(point))
      map.current.fitBounds(bounds, { padding: 50 })
    } catch (error) {
      console.error("Error updating radius circle:", error)
    }
  }, [radius, circuitLatitude, circuitLongitude])

  return (
    <div ref={mapContainer} className="h-[300px] w-full rounded-lg border" />
  )
}

// Helper function to create a GeoJSON circle
function createGeoJSONCircle(
  center: [number, number],
  radiusInKm: number
): GeoJSON.Feature<GeoJSON.Polygon> {
  const points = 64
  const coords: GeoJSON.Feature<GeoJSON.Polygon> = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[]]
    },
    properties: {}
  }

  const km = radiusInKm
  const ret: [number, number][] = []
  const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180))
  const distanceY = km / 110.574

  let theta: number
  let x: number
  let y: number

  for (let i = 0; i < points; i++) {
    theta = (i / points) * (2 * Math.PI)
    x = distanceX * Math.cos(theta)
    y = distanceY * Math.sin(theta)
    ret.push([center[0] + x, center[1] + y])
  }
  ret.push(ret[0])

  coords.geometry.coordinates = [ret]
  return coords
}

// Helper function to calculate bounding box points for the radius
function calculateBoundingBox(
  center: [number, number],
  radiusInKm: number
): [number, number][] {
  const km = radiusInKm
  const distanceX = km / (111.32 * Math.cos((center[1] * Math.PI) / 180))
  const distanceY = km / 110.574

  return [
    [center[0] - distanceX, center[1] - distanceY], // SW
    [center[0] + distanceX, center[1] - distanceY], // SE
    [center[0] + distanceX, center[1] + distanceY], // NE
    [center[0] - distanceX, center[1] + distanceY] // NW
  ]
}
