import { NextResponse } from "next/server"
import { db } from "@/db/db"
import { racesTable, seriesTable, supportingSeriesTable } from "@/db/schema"
import { and, gte, lte, isNotNull, eq } from "drizzle-orm"
import { SupportingSeriesMapper } from "@/services/openf1/supporting-series-mapper"
import { getProvider } from "@/services/providers"
import { verifyCronRequest } from "@/lib/cron"

export const dynamic = "force-dynamic"
export const maxDuration = 60

// Vercel Cron invokes routes with GET; keep POST for manual/authenticated triggers.
export async function GET(req: Request) {
  return handleUpdateSessions(req)
}

export async function POST(req: Request) {
  return handleUpdateSessions(req)
}

async function handleUpdateSessions(req: Request) {
  const denied = verifyCronRequest(req)
  if (denied) return denied

  try {
    const now = new Date()
    const windowStart = new Date(now.getTime() - 2 * 60 * 60 * 1000) // 2 hours ago
    const windowEnd = new Date(now.getTime() + 2 * 60 * 60 * 1000) // 2 hours from now

    // Find active races (any series) with their series' data-provider slug.
    const activeRaces = await db
      .select({
        race: racesTable,
        dataProvider: seriesTable.dataProvider
      })
      .from(racesTable)
      .leftJoin(seriesTable, eq(racesTable.seriesId, seriesTable.id))
      .where(
        and(gte(racesTable.date, windowStart), lte(racesTable.date, windowEnd))
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

    const supportingSeriesMapper = new SupportingSeriesMapper()

    // Update races via each series' data provider. Races without a series (legacy
    // rows pre-backfill) fall back to openf1 when they carry an OpenF1 key, else manual.
    for (const { race, dataProvider } of activeRaces) {
      try {
        const slug =
          dataProvider ?? (race.openf1SessionKey ? "openf1" : "manual")
        await getProvider(slug).updateRaceStatus(race)
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
