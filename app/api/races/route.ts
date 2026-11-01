import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { racesTable, seriesTable } from "@/db/schema"
import { eq } from "drizzle-orm"
import { raceRowWithSeries } from "@/lib/race-api-row"

export async function GET() {
  try {
    const rows = await db
      .select({
        race: racesTable,
        seriesSlug: seriesTable.slug
      })
      .from(racesTable)
      .leftJoin(seriesTable, eq(racesTable.seriesId, seriesTable.id))

    return NextResponse.json({
      data: rows.map(row => raceRowWithSeries(row.race, row.seriesSlug))
    })
  } catch (error) {
    console.error("Error fetching races:", error)
    return NextResponse.json(
      { error: "Failed to fetch races" },
      { status: 500 }
    )
  }
}
