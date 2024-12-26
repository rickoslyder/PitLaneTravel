import { Client } from "@googlemaps/google-maps-services-js"

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
