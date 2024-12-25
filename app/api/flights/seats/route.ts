import { NextRequest, NextResponse } from "next/server"
import { Duffel } from "@duffel/api"

const duffel = new Duffel({
  token: process.env.DUFFEL_ACCESS_TOKEN!
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const offerId = searchParams.get("offerId")
    const sliceId = searchParams.get("sliceId")

    if (!offerId || !sliceId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      )
    }

    const seatMaps = await duffel.seatMaps.get({
      offer_id: offerId
    })

    // Filter the seat maps to get the one for the requested slice
    const seatMap = seatMaps.data.find(map => map.slice_id === sliceId)

    if (!seatMap) {
      return NextResponse.json(
        { error: "Seat map not found for the specified slice" },
        { status: 404 }
      )
    }

    return NextResponse.json(seatMap)
  } catch (error) {
    console.error("Error fetching seat maps:", error)
    return NextResponse.json(
      { error: "Failed to fetch seat maps" },
      { status: 500 }
    )
  }
}
