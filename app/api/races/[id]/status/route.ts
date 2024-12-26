import { eq } from "drizzle-orm"
import { db } from "@/db/db"
import { racesTable } from "@/db/schema"
import { RaceMapper } from "@/services/openf1/race-mapper"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get race status from our DB (already updated by SessionUpdater)
    const resolvedParams = await params
    const race = await db
      .select({
        id: racesTable.id,
        status: racesTable.status,
        openf1SessionKey: racesTable.openf1SessionKey
      })
      .from(racesTable)
      .where(eq(racesTable.id, resolvedParams.id))
      .limit(1)
      .then(rows => rows[0])

    if (!race) {
      return new NextResponse("Race not found", { status: 404 })
    }

    // If race has OpenF1 mapping, get additional real-time data
    let additionalData = null
    if (race.openf1SessionKey) {
      const raceMapper = new RaceMapper()
      const openF1Data = await raceMapper.getOpenF1Session(
        race.id,
        new Date().getFullYear()
      )
      if (openF1Data) {
        additionalData = {
          sessionType: openF1Data.session_type,
          date: openF1Data.date
          // Add more OpenF1 data as needed
        }
      }
    }

    return NextResponse.json({
      status: race.status,
      openf1Data: additionalData
    })
  } catch (error) {
    console.error("Error fetching race status:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
