import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { racesTable } from "@/db/schema"

export async function GET() {
  try {
    const allRaces = await db.select().from(racesTable)
    return NextResponse.json({ data: allRaces })
  } catch (error) {
    console.error("Error fetching races:", error)
    return NextResponse.json(
      { error: "Failed to fetch races" },
      { status: 500 }
    )
  }
}
