import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/db"
import { racesTable } from "@/db/schema"
import { eq, ne, and } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const resolvedParams = await params
    // First get the current race
    const [currentRace] = await db
      .select()
      .from(racesTable)
      .where(eq(racesTable.id, resolvedParams.id))

    if (!currentRace) {
      return NextResponse.json({ error: "Race not found" }, { status: 404 })
    }

    // Then find similar races based on country and season
    const similarRaces = await db
      .select()
      .from(racesTable)
      .where(
        and(
          ne(racesTable.id, resolvedParams.id),
          eq(racesTable.country, currentRace.country)
        )
      )
      .limit(3)

    return NextResponse.json({ data: similarRaces })
  } catch (error) {
    console.error("Error fetching similar races:", error)
    return NextResponse.json(
      { error: "Failed to fetch similar races" },
      { status: 500 }
    )
  }
}
