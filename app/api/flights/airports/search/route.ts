import { NextResponse } from "next/server"
import { Duffel } from "@duffel/api"
import { Airport } from "@duffel/api/types"

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN || ""
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter" },
        { status: 400 }
      )
    }

    const airports = await duffel.airports.list({
      limit: 10
    })

    // Filter and transform airports based on the search query
    const transformedAirports = airports.data
      .filter((airport: Airport) => {
        const searchTerm = query.toLowerCase()
        return (
          airport.iata_code?.toLowerCase().includes(searchTerm) ||
          airport.name.toLowerCase().includes(searchTerm) ||
          airport.city?.name.toLowerCase().includes(searchTerm)
        )
      })
      .map((airport: Airport) => ({
        code: airport.iata_code,
        name: airport.name,
        city: airport.city?.name,
        timeZone: airport.time_zone
      }))

    return NextResponse.json({
      success: true,
      airports: transformedAirports
    })
  } catch (error) {
    console.error("Error searching airports:", error)
    return NextResponse.json(
      { error: "Failed to search airports" },
      { status: 500 }
    )
  }
}
