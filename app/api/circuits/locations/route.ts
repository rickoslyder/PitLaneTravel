"use server"

import { db } from "@/db/db"
import { circuitLocationsTable } from "@/db/schema"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    // Validate required fields
    if (
      !data.circuitId ||
      !data.type ||
      !data.name ||
      !data.latitude ||
      !data.longitude
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Insert the location
    const [newLocation] = await db
      .insert(circuitLocationsTable)
      .values({
        circuitId: data.circuitId,
        type: data.type,
        name: data.name,
        latitude: data.latitude,
        longitude: data.longitude,
        distanceFromCircuit: data.distanceFromCircuit,
        placeId: data.placeId,
        airportCode: data.airportCode,
        transferTime: data.transferTime
      })
      .returning()

    return NextResponse.json({
      success: true,
      message: "Location added successfully",
      data: newLocation
    })
  } catch (error) {
    console.error("Error adding circuit location:", error)
    return NextResponse.json(
      { error: "Failed to add circuit location" },
      { status: 500 }
    )
  }
}
