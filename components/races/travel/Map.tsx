"use client"

import { SelectCircuitLocation } from "@/db/schema"
import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"

// Initialize with your Mapbox access token
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""

interface MapProps {
  center: [number, number]
  airports: SelectCircuitLocation[]
}

export default function Map({ center, airports }: MapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map centered on circuit
    const newMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: center,
      zoom: 8,
      pitchWithRotate: false,
      dragRotate: false
    })

    // Add navigation controls
    newMap.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    )

    // Add fullscreen control
    newMap.addControl(new mapboxgl.FullscreenControl(), "top-right")

    map.current = newMap

    // Wait for map to load before adding markers
    newMap.on("load", () => {
      // Clear existing markers
      markersRef.current.forEach(marker => marker.remove())
      markersRef.current = []

      // Calculate initial bounds centered on circuit
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend(center)

      // Add circuit marker with custom element
      const circuitMarker = document.createElement("div")
      circuitMarker.className = "circuit-marker"
      circuitMarker.innerHTML = `
                <div class="w-8 h-8 bg-[#E10600] rounded-full flex items-center justify-center 
                           shadow-lg border-2 border-white transform-gpu hover:scale-110 transition-transform">
                    <span class="text-white text-xl">🏁</span>
                </div>
            `

      const circuitMarkerInstance = new mapboxgl.Marker({
        element: circuitMarker,
        anchor: "center"
      })
        .setLngLat(center)
        .setPopup(
          new mapboxgl.Popup({
            offset: 25,
            closeButton: false,
            className: "custom-popup"
          }).setHTML(`
                        <div class="p-3 font-medium">
                            <h3 class="text-base mb-1">Circuit Location</h3>
                            <div class="text-sm text-gray-500">Race Venue</div>
                        </div>
                    `)
        )
        .addTo(newMap)

      markersRef.current.push(circuitMarkerInstance)

      // Add airport markers and extend bounds
      airports.forEach(airport => {
        const position: [number, number] = [
          Number(airport.longitude),
          Number(airport.latitude)
        ]
        bounds.extend(position)

        // Create custom airport marker element
        const airportMarker = document.createElement("div")
        airportMarker.className = "airport-marker"
        airportMarker.innerHTML = `
                    <div class="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center 
                               shadow-lg border-2 border-white transform-gpu hover:scale-110 transition-transform">
                    <span class="text-white text-xl">✈️</span>
                    </div>
                `

        const marker = new mapboxgl.Marker({
          element: airportMarker,
          anchor: "center"
        })
          .setLngLat(position)
          .setPopup(
            new mapboxgl.Popup({
              offset: 25,
              closeButton: false,
              className: "custom-popup"
            }).setHTML(`
                            <div class="p-3">
                                <h3 class="font-medium text-base mb-1">${airport.name}</h3>
                                <div class="space-y-1 text-sm text-gray-500">
                                    <div>Code: ${airport.airportCode || "N/A"}</div>
                                    <div>Distance: ${airport.distanceFromCircuit}km</div>
                                    ${airport.transferTime ? `<div>Transfer: ${airport.transferTime}</div>` : ""}
                                </div>
                            </div>
                        `)
          )
          .addTo(newMap)

        markersRef.current.push(marker)
      })

      // First center the map on the circuit
      newMap.setCenter(center)

      // Then fit bounds if there are airports
      if (airports.length > 0) {
        // Add padding to bounds to ensure visibility
        const boundsPadding = {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }

        // Calculate optimal zoom based on bounds
        newMap.fitBounds(bounds, {
          padding: boundsPadding,
          maxZoom: 10,
          duration: 1000
        })
      } else {
        // If no airports, just zoom out slightly from the circuit
        newMap.setZoom(8)
      }
    })

    // Cleanup
    return () => {
      markersRef.current.forEach(marker => marker.remove())
      newMap.remove()
    }
  }, [center, airports])

  return (
    <>
      <style jsx global>{`
        .mapboxgl-popup-content {
          border-radius: 0.5rem;
          padding: 0;
          box-shadow:
            0 4px 6px -1px rgb(0 0 0 / 0.1),
            0 2px 4px -2px rgb(0 0 0 / 0.1);
        }
        .mapboxgl-popup-tip {
          display: none;
        }
        .mapboxgl-ctrl-group {
          border-radius: 0.5rem !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          width: 36px !important;
          height: 36px !important;
        }
        .mapboxgl-ctrl-group button:focus {
          box-shadow: none !important;
        }
      `}</style>
      <div ref={mapContainer} className="h-[400px] w-full rounded-lg" />
    </>
  )
}
