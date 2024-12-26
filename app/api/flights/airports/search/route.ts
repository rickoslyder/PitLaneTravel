import { NextResponse } from "next/server"
import { Duffel } from "@duffel/api"
import type { Places } from "@duffel/api/types"

interface PopularAirport {
  query: string
  name: string
}

interface AirportResult {
  code: string
  name: string
  city?: string | null
  timeZone: string | null
}

interface ValidAirport {
  iata_code: string
  name: string
  city_name?: string | null
  time_zone: string | null
}

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || ""
})

// Popular airports to show when no search query
const POPULAR_AIRPORTS: PopularAirport[] = [
  { query: "LHR", name: "London Heathrow" },
  { query: "JFK", name: "New York JFK" },
  { query: "DXB", name: "Dubai International" },
  { query: "CDG", name: "Paris Charles de Gaulle" },
  { query: "AMS", name: "Amsterdam Schiphol" },
  { query: "SIN", name: "Singapore Changi" },
  { query: "HKG", name: "Hong Kong International" },
  { query: "DFW", name: "Dallas/Fort Worth" },
  { query: "FRA", name: "Frankfurt" },
  { query: "IST", name: "Istanbul" }
]

function isValidAirport(airport: any): airport is ValidAirport {
  return (
    airport &&
    typeof airport.iata_code === "string" &&
    airport.iata_code.length > 0 &&
    typeof airport.name === "string" &&
    (airport.city_name === undefined ||
      airport.city_name === null ||
      typeof airport.city_name === "string")
  )
}

export async function GET(request: Request) {
  try {
    console.log("Airport search request received")
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")
    console.log("Search query:", query)

    // If no query, return popular airports
    if (!query) {
      console.log("No query, fetching popular airports...")
      const popularAirports = []

      // Fetch popular airports in parallel
      const promises = POPULAR_AIRPORTS.map(async (airport: PopularAirport) => {
        const response = await duffel.suggestions.list({ query: airport.query })
        return response.data[0]
      })

      const results = await Promise.all(promises)
      const airports = results
        .filter(Boolean)
        .filter(isValidAirport)
        .map(
          (airport): AirportResult => ({
            code: airport.iata_code,
            name: airport.name,
            city: airport.city_name,
            timeZone: airport.time_zone
          })
        )

      return NextResponse.json({
        success: true,
        airports
      })
    }

    if (query.length < 2) {
      console.log("Query too short, returning empty results")
      return NextResponse.json({
        success: true,
        airports: []
      })
    }

    console.log("Fetching airports from Duffel...")
    const response = await duffel.suggestions.list({ query })
    console.log("Raw response:", response)

    // Process both direct airport matches and city matches
    const airports = response.data.flatMap((place: Places): AirportResult[] => {
      // For direct airport matches
      if (place.type === "airport" && isValidAirport(place)) {
        return [
          {
            code: place.iata_code,
            name: place.name,
            city: place.city_name,
            timeZone: place.time_zone
          }
        ]
      }

      // For city matches, include all their airports
      if (place.type === "city" && place.airports?.length) {
        return place.airports.filter(isValidAirport).map(airport => ({
          code: airport.iata_code,
          name: airport.name,
          city: place.name, // Use city name for all airports in this city
          timeZone: airport.time_zone
        }))
      }

      return []
    })

    console.log("Transformed airports:", airports)

    return NextResponse.json({
      success: true,
      airports: airports.filter(airport => airport.code)
    })
  } catch (error) {
    console.error("Error searching airports:", error)
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack
      })
    }
    return NextResponse.json(
      { success: false, message: "Failed to search airports" },
      { status: 500 }
    )
  }
}
