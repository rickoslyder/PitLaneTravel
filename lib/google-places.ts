import { Client, PlaceType1 } from "@googlemaps/google-maps-services-js"

if (!process.env.GOOGLE_MAPS_API_KEY) {
  throw new Error("GOOGLE_MAPS_API_KEY is required")
}

const client = new Client({})

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
    const response = await client.placesNearby({
      params: {
        location: { lat: latitude, lng: longitude },
        radius,
        type: type as any, // The type system is a bit strict here
        key: process.env.GOOGLE_MAPS_API_KEY!
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
    const response = await client.textSearch({
      params: {
        query,
        key: process.env.GOOGLE_MAPS_API_KEY!
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
    const response = await client.placeDetails({
      params: {
        place_id: placeId,
        key: process.env.GOOGLE_MAPS_API_KEY!
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
    const response = await client.geocode({
      params: {
        address,
        key: process.env.GOOGLE_MAPS_API_KEY!
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
 * Find airport coordinates using name or code
 */
export async function findAirportCoordinates(
  searchTerm: string
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const response = await client.textSearch({
      params: {
        query: `${searchTerm} airport`,
        type: "airport" as PlaceType1,
        key: process.env.GOOGLE_MAPS_API_KEY!
      }
    })

    if (response.data.status !== "OK" || !response.data.results.length) {
      return null
    }

    const airport = response.data.results[0]
    if (!airport.geometry?.location) {
      return null
    }

    return {
      latitude: airport.geometry.location.lat,
      longitude: airport.geometry.location.lng
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
  radiusInKm: number = 100
): Promise<
  Array<{
    name: string
    latitude: number
    longitude: number
    distance: number
    placeId: string
  }>
> {
  try {
    const response = await client.placesNearby({
      params: {
        location: { lat: latitude, lng: longitude },
        radius: radiusInKm * 1000, // Convert to meters
        type: "airport" as PlaceType1,
        key: process.env.GOOGLE_MAPS_API_KEY!
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
      .map(airport => ({
        name: airport.name!,
        latitude: airport.geometry!.location.lat,
        longitude: airport.geometry!.location.lng,
        distance: calculateDistance(
          latitude,
          longitude,
          airport.geometry!.location.lat,
          airport.geometry!.location.lng
        ),
        placeId: airport.place_id!
      }))
  } catch (error) {
    console.error("Error finding nearby airports:", error)
    throw error
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
