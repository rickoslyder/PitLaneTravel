import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { racesTable, supportingSeriesTable } from "@/db/schema"
import { and, gte, lte, isNotNull } from "drizzle-orm"
import { RaceMapper } from "@/services/openf1/race-mapper"
import { SupportingSeriesMapper } from "@/services/openf1/supporting-series-mapper"

// Only allow POST requests from Vercel Cron
export const runtime = "edge"
export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function POST(req: Request) {
  try {
    // Verify the request is from Vercel Cron
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const now = new Date()
    const windowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    const windowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now

    // Find active races
    const activeRaces = await db
      .select()
      .from(racesTable)
      .where(
        and(
          gte(racesTable.date, windowStart),
          lte(racesTable.date, windowEnd),
          isNotNull(racesTable.openf1SessionKey)
        )
      )

    // Find active supporting series
    const activeSupportingSeries = await db
      .select()
      .from(supportingSeriesTable)
      .where(
        and(
          gte(supportingSeriesTable.startTime, windowStart),
          lte(supportingSeriesTable.startTime, windowEnd),
          isNotNull(supportingSeriesTable.openf1SessionKey)
        )
      )

    const raceMapper = new RaceMapper()
    const supportingSeriesMapper = new SupportingSeriesMapper()

    // Update races
    for (const race of activeRaces) {
      try {
        await raceMapper.updateRaceStatus(race)
      } catch (error) {
        console.error(`Failed to update race ${race.id}:`, error)
      }
    }

    // Update supporting series
    for (const series of activeSupportingSeries) {
      try {
        await supportingSeriesMapper.updateSupportingSeriesStatus(series)
      } catch (error) {
        console.error(`Failed to update supporting series ${series.id}:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      updatedRaces: activeRaces.length,
      updatedSupportingSeries: activeSupportingSeries.length
    })
  } catch (error) {
    console.error("Failed to update sessions:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}
