import { Client, PlaceType1 } from "@googlemaps/google-maps-services-js"
import { Duffel } from "@duffel/api"

if (!process.env.GOOGLE_MAPS_API_KEY) {
  console.error("GOOGLE_MAPS_API_KEY environment variable is not defined")
  throw new Error(
    "GOOGLE_MAPS_API_KEY is required. Please check your environment variables."
  )
}

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY
const googleClient = new Client({})
const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || ""
})

interface PlaceResult {
  name: string
  vicinity?: string
  rating?: number
  price_level?: number
  business_status?: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  types?: string[]
}

function isValidPlace(place: any): place is PlaceResult {
  return (
    place &&
    typeof place.name === "string" &&
    place.geometry?.location?.lat !== undefined &&
    place.geometry?.location?.lng !== undefined
  )
}

function createPlaceResult(place: any): PlaceResult {
  if (!isValidPlace(place)) {
    throw new Error("Invalid place data")
  }

  return {
    name: place.name,
    vicinity: place.vicinity || undefined,
    rating: place.rating,
    price_level: place.price_level,
    business_status: place.business_status,
    geometry: {
      location: {
        lat: place.geometry.location.lat,
        lng: place.geometry.location.lng
      }
    },
    types: place.types
  }
}

/**
 * Search for places near a location using the Places API (New)
 */
export async function searchNearbyPlaces(
  latitude: number,
  longitude: number,
  radius: number,
  type?: string
): Promise<PlaceResult[]> {
  try {
    const response = await googleClient.placesNearby({
      params: {
        location: { lat: latitude, lng: longitude },
        radius,
        type: type as any,
        key: GOOGLE_MAPS_API_KEY
      }
    })

    if (response.data.status !== "OK") {
      throw new Error(`Places API error: ${response.data.status}`)
    }

    return response.data.results.filter(isValidPlace).map(createPlaceResult)
  } catch (error) {
    console.error("Error searching nearby places:", error)
    throw error
  }
}

/**
 * Search for places using text query
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  try {
    const response = await googleClient.textSearch({
      params: {
        query,
        key: GOOGLE_MAPS_API_KEY
      }
    })

    if (response.data.status !== "OK") {
      throw new Error(`Places API error: ${response.data.status}`)
    }

    return response.data.results.filter(isValidPlace).map(place => ({
      ...createPlaceResult(place),
      vicinity: place.formatted_address
    }))
  } catch (error) {
    console.error("Error searching places:", error)
    throw error
  }
}

/**
 * Get details for a specific place
 */
export async function getPlaceDetails(placeId: string) {
  try {
    const response = await googleClient.placeDetails({
      params: {
        place_id: placeId,
        key: GOOGLE_MAPS_API_KEY
      }
    })

    if (response.data.status !== "OK") {
      throw new Error(`Places API error: ${response.data.status}`)
    }

    const place = createPlaceResult(response.data.result)
    return {
      ...place,
      vicinity: response.data.result.formatted_address,
      website: response.data.result.website,
      formatted_phone_number: response.data.result.formatted_phone_number,
      opening_hours: response.data.result.opening_hours?.weekday_text
    }
  } catch (error) {
    console.error("Error getting place details:", error)
    throw error
  }
}

/**
 * Geocode an address or location name
 */
export async function geocodeLocation(address: string) {
  try {
    const response = await googleClient.geocode({
      params: {
        address,
        key: GOOGLE_MAPS_API_KEY
      }
    })

    if (response.data.status !== "OK" || !response.data.results.length) {
      throw new Error(`Geocoding API error: ${response.data.status}`)
    }

    const location = response.data.results[0]
    if (!location.geometry?.location) {
      throw new Error("Invalid location data received")
    }

    return {
      name: location.formatted_address || address,
      latitude: location.geometry.location.lat,
      longitude: location.geometry.location.lng
    }
  } catch (error) {
    console.error("Error geocoding location:", error)
    throw error
  }
}

/**
 * Find airport details using Duffel API
 */
export async function findAirportDetails(searchTerm: string): Promise<{
  name: string
  iata_code?: string
  latitude?: number
  longitude?: number
  icao_code?: string
} | null> {
  if (!process.env.DUFFEL_ACCESS_TOKEN) {
    console.warn("DUFFEL_ACCESS_TOKEN is not set")
    return null
  }

  try {
    const response = await fetch("https://api.duffel.com/air/airports", {
      headers: {
        Accept: "application/json",
        "Duffel-Version": "v2",
        Authorization: `Bearer ${process.env.DUFFEL_ACCESS_TOKEN}`
      }
    })

    if (!response.ok) {
      throw new Error(`Duffel API error: ${response.statusText}`)
    }

    const data = await response.json()
    const airports = data.data

    // Find the most relevant airport
    const airport = airports.find((a: any) => {
      const nameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase())
      const codeMatch = a.iata_code?.toLowerCase() === searchTerm.toLowerCase()
      return nameMatch || codeMatch
    })

    if (!airport) {
      return null
    }

    return {
      name: airport.name,
      iata_code: airport.iata_code,
      latitude: airport.latitude,
      longitude: airport.longitude,
      icao_code: airport.icao_code
    }
  } catch (error) {
    console.error("Error fetching airport details from Duffel:", error)
    return null
  }
}

/**
 * Find airport coordinates using name or code
 */
export async function findAirportCoordinates(searchTerm: string): Promise<{
  latitude: number
  longitude: number
  airportCode?: string
} | null> {
  // First try Duffel API
  const duffelResult = await findAirportDetails(searchTerm)
  if (duffelResult?.latitude && duffelResult?.longitude) {
    return {
      latitude: duffelResult.latitude,
      longitude: duffelResult.longitude,
      airportCode: duffelResult.iata_code
    }
  }

  // Fallback to Google Places API
  try {
    const response = await googleClient.textSearch({
      params: {
        query: `${searchTerm} airport`,
        type: "airport" as PlaceType1,
        key: GOOGLE_MAPS_API_KEY
      }
    })

    if (response.data.status !== "OK" || !response.data.results.length) {
      return null
    }

    const airport = response.data.results[0]
    if (!airport.geometry?.location || !airport.name) {
      return null
    }

    // Extract airport code from name (usually in parentheses)
    const codeMatch = airport.name.match(/\(([A-Z]{3})\)/)
    const airportCode = codeMatch ? codeMatch[1] : undefined

    return {
      latitude: airport.geometry.location.lat,
      longitude: airport.geometry.location.lng,
      airportCode
    }
  } catch (error) {
    console.error("Error finding airport coordinates:", error)
    throw error
  }
}

/**
 * Find nearby airports within radius
 */
export async function findNearbyAirports(
  latitude: number,
  longitude: number,
  radiusInKm: number = 200
): Promise<
  Array<{
    name: string
    latitude: number
    longitude: number
    distance: number
    placeId?: string
    airportCode?: string
  }>
> {
  if (!process.env.DUFFEL_ACCESS_TOKEN) {
    console.warn("DUFFEL_ACCESS_TOKEN is not set")
    return []
  }

  try {
    // Convert km to meters for Duffel API
    const radiusInMeters = radiusInKm * 1000

    const { data: places } = await duffel.suggestions.list({
      lat: latitude.toString(),
      lng: longitude.toString(),
      rad: radiusInMeters.toString()
    })

    console.log("Duffel API response:", places)

    // Filter to only include airports and calculate distances
    return places
      .filter((place: { type: string }) => place.type === "airport")
      .map(
        (airport: {
          name: string
          latitude: number | null
          longitude: number | null
          id: string
          iata_code?: string
        }) => ({
          name: airport.name,
          latitude: airport.latitude || 0,
          longitude: airport.longitude || 0,
          distance: calculateDistance(
            latitude,
            longitude,
            airport.latitude || 0,
            airport.longitude || 0
          ),
          airportCode: airport.iata_code,
          placeId: airport.id
        })
      )
      .sort((a, b) => a.distance - b.distance)
  } catch (error) {
    console.error("Error finding nearby airports:", error)
    // Fallback to Google Places API if Duffel fails
    try {
      const response = await googleClient.placesNearby({
        params: {
          location: { lat: latitude, lng: longitude },
          radius: radiusInKm * 1000,
          type: "airport" as PlaceType1,
          key: GOOGLE_MAPS_API_KEY
        }
      })

      if (response.data.status !== "OK") {
        return []
      }

      return response.data.results
        .filter(
          airport =>
            airport.name && airport.geometry?.location && airport.place_id
        )
        .map(airport => {
          const codeMatch = airport.name!.match(/\(([A-Z]{3})\)/)
          return {
            name: airport.name!,
            latitude: airport.geometry!.location.lat,
            longitude: airport.geometry!.location.lng,
            distance: calculateDistance(
              latitude,
              longitude,
              airport.geometry!.location.lat,
              airport.geometry!.location.lng
            ),
            placeId: airport.place_id!,
            airportCode: codeMatch ? codeMatch[1] : undefined
          }
        })
        .sort((a, b) => a.distance - b.distance)
    } catch (fallbackError) {
      console.error("Error in Google Places fallback:", fallbackError)
      return []
    }
  }
}

// Helper function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

function toRad(value: number): number {
  return (value * Math.PI) / 180
}
