"use server"

import { db } from "@/db/db"
import { racesTable } from "@/db/schema"
import { ActionState } from "@/types"
import { eq } from "drizzle-orm"
import { OpenF1Client } from "@/services/openf1/client"
import { RaceMapper } from "@/services/openf1/race-mapper"
import { transformSession } from "@/types/openf1-types"

export interface SessionSchedule {
  id: string
  sessionType: "fp1" | "fp2" | "fp3" | "qualifying" | "sprint" | "race"
  startTime: Date
  endTime: Date
  status: "scheduled" | "live" | "completed" | "delayed" | "cancelled"
}

export async function getSessionSchedulesAction(
  raceId: string
): Promise<ActionState<SessionSchedule[]>> {
  try {
    // Get race details to get OpenF1 mapping
    const race = await db
      .select({
        id: racesTable.id,
        season: racesTable.season,
        openf1MeetingKey: racesTable.openf1MeetingKey
      })
      .from(racesTable)
      .where(eq(racesTable.id, raceId))
      .limit(1)
      .then(rows => rows[0])

    if (!race) {
      return { isSuccess: false, message: "Race not found" }
    }

    if (!race.openf1MeetingKey) {
      return { isSuccess: false, message: "Race not mapped to OpenF1" }
    }

    // Get all sessions for this season
    const client = new OpenF1Client()
    const sessions = await client.getSessions(race.season)

    // Filter sessions for this race's meeting
    const raceSessions = sessions.filter(
      s => s.meeting_key === race.openf1MeetingKey
    )

    // Transform sessions to our format
    const schedules = raceSessions.map(session => ({
      ...transformSession(session),
      id: session.session_key.toString()
    }))

    return {
      isSuccess: true,
      message: "Session schedules retrieved successfully",
      data: schedules
    }
  } catch (error) {
    console.error("Error getting session schedules:", error)
    return { isSuccess: false, message: "Failed to get session schedules" }
  }
} 