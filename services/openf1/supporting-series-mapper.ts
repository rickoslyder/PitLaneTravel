import { eq } from "drizzle-orm"
import { db } from "@/db/db"
import { racesTable, supportingSeriesTable, SelectSupportingSeries } from "@/db/schema"
import { OpenF1Client } from "./client"
import { OpenF1Session } from "./types"
import { RaceMapper } from "./race-mapper"

export class SupportingSeriesMapper {
  private client: OpenF1Client
  private raceMapper: RaceMapper

  constructor() {
    this.client = new OpenF1Client()
    this.raceMapper = new RaceMapper()
  }

  /**
   * Initialize OpenF1 mappings for all supporting series in our database for a given season
   */
  async initializeSupportingSeriesMappings(season: number) {
    // First get all races for the season
    const races = await db
      .select({
        id: racesTable.id,
        openf1MeetingKey: racesTable.openf1MeetingKey
      })
      .from(racesTable)
      .where(eq(racesTable.season, season))

    let mappedCount = 0

    for (const race of races) {
      try {
        // Get supporting series for this race
        const supportingSeries = await db
          .select()
          .from(supportingSeriesTable)
          .where(eq(supportingSeriesTable.raceId, race.id))

        // Skip if no supporting series or no meeting key
        if (!race.openf1MeetingKey || supportingSeries.length === 0) continue

        // Get all sessions for this season
        const sessions = await this.client.getSessions(season)

        // Find matching supporting series sessions
        const supportingSessions = sessions.filter(
          session =>
            session.meeting_key === race.openf1MeetingKey &&
            session.session_type !== "race" &&
            session.session_type !== "qualifying" &&
            session.session_type !== "practice_1" &&
            session.session_type !== "practice_2" &&
            session.session_type !== "practice_3"
        )

        // Map each supporting series to a session
        for (const series of supportingSeries) {
          // Skip if already mapped
          if (series.openf1SessionKey) continue

          // Find a matching session
          const session = supportingSessions.find(s => 
            s.session_type.toLowerCase().includes(series.series.toLowerCase())
          )

          if (session) {
            await db
              .update(supportingSeriesTable)
              .set({
                openf1SessionKey: session.session_key,
                startTime: new Date(session.date),
                endTime: new Date(new Date(session.date).getTime() + 3600000), // Assume 1 hour duration
                status: this.mapSessionStatus(session.status)
              })
              .where(eq(supportingSeriesTable.id, series.id))

            mappedCount++
          }
        }
      } catch (error) {
        console.error(
          `Error mapping supporting series for race ${race.id}:`,
          error instanceof Error ? error.message : error
        )
      }
    }

    return {
      totalSeries: (await db.select().from(supportingSeriesTable)).length,
      mappedSeries: mappedCount
    }
  }

  /**
   * Get OpenF1 session key for a given supporting series ID
   */
  async getOpenF1SessionKey(seriesId: string): Promise<number | null> {
    const series = await db
      .select({ openf1SessionKey: supportingSeriesTable.openf1SessionKey })
      .from(supportingSeriesTable)
      .where(eq(supportingSeriesTable.id, seriesId))
      .limit(1)
      .then(rows => rows[0])

    return series?.openf1SessionKey ?? null
  }

  /**
   * Get our supporting series ID for a given OpenF1 session key
   */
  async getSeriesId(openF1SessionKey: number): Promise<string | null> {
    const series = await db
      .select({ id: supportingSeriesTable.id })
      .from(supportingSeriesTable)
      .where(eq(supportingSeriesTable.openf1SessionKey, openF1SessionKey))
      .limit(1)
      .then(rows => rows[0])

    return series?.id ?? null
  }

  /**
   * Get OpenF1 session details for a given supporting series ID
   */
  async getOpenF1Session(seriesId: string): Promise<OpenF1Session | null> {
    const sessionKey = await this.getOpenF1SessionKey(seriesId)
    if (!sessionKey) return null

    // Get the race season for this supporting series
    const series = await db
      .select({
        raceId: supportingSeriesTable.raceId
      })
      .from(supportingSeriesTable)
      .where(eq(supportingSeriesTable.id, seriesId))
      .limit(1)
      .then(rows => rows[0])

    if (!series) return null

    const race = await db
      .select({
        season: racesTable.season
      })
      .from(racesTable)
      .where(eq(racesTable.id, series.raceId))
      .limit(1)
      .then(rows => rows[0])

    if (!race) return null

    try {
      const sessions = await this.client.getSessions(race.season)
      return sessions.find(s => s.session_key === sessionKey) ?? null
    } catch (error) {
      console.error(
        `Error fetching OpenF1 session details for key ${sessionKey}:`,
        error instanceof Error ? error.message : error
      )
      return null
    }
  }

  /**
   * Map OpenF1 session status to our supporting series status
   */
  private mapSessionStatus(openF1Status: string): "scheduled" | "live" | "completed" | "delayed" | "cancelled" {
    switch (openF1Status.toLowerCase()) {
      case "started":
        return "live"
      case "finished":
        return "completed"
      case "delayed":
        return "delayed"
      case "cancelled":
        return "cancelled"
      default:
        return "scheduled"
    }
  }

  /**
   * Verify supporting series mapping integrity for a given season
   */
  async verifyMappings(season: number) {
    // Get all supporting series for the season through a join
    const series = await db
      .select({
        id: supportingSeriesTable.id,
        series: supportingSeriesTable.series,
        openf1SessionKey: supportingSeriesTable.openf1SessionKey,
        startTime: supportingSeriesTable.startTime
      })
      .from(supportingSeriesTable)
      .innerJoin(
        racesTable,
        eq(supportingSeriesTable.raceId, racesTable.id)
      )
      .where(eq(racesTable.season, season))

    const results = {
      total: series.length,
      mapped: 0,
      unmapped: 0,
      verified: 0,
      failed: 0,
      failures: [] as { seriesId: string; name: string; reason: string }[]
    }

    for (const s of series) {
      if (!s.openf1SessionKey) {
        results.unmapped++
        results.failures.push({
          seriesId: s.id,
          name: s.series,
          reason: "No OpenF1 mapping"
        })
        continue
      }

      results.mapped++

      try {
        const sessions = await this.client.getSessions(season)
        const session = sessions.find(sess => sess.session_key === s.openf1SessionKey)

        if (session) {
          // Verify the session date matches our start time
          const sessionDate = new Date(session.date).toISOString().split("T")[0]
          const seriesDate = s.startTime?.toISOString().split("T")[0]

          if (sessionDate === seriesDate) {
            results.verified++
          } else {
            results.failed++
            results.failures.push({
              seriesId: s.id,
              name: s.series,
              reason: `Date mismatch: Series=${seriesDate}, Session=${sessionDate}`
            })
          }
        } else {
          results.failed++
          results.failures.push({
            seriesId: s.id,
            name: s.series,
            reason: "OpenF1 session not found"
          })
        }
      } catch (error) {
        results.failed++
        results.failures.push({
          seriesId: s.id,
          name: s.series,
          reason: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return results
  }

  async updateSupportingSeriesStatus(series: SelectSupportingSeries) {
    try {
      const openF1Session = await this.client.getSessions(series.openf1SessionKey!)
      if (!openF1Session?.length) {
        throw new Error(`No OpenF1 session found for supporting series ${series.id}`)
      }

      // Update supporting series status
      await db
        .update(supportingSeriesTable)
        .set({
          status: openF1Session[0].status as any, // We'll need to make sure the enum values match
          updatedAt: new Date()
        })
        .where(eq(supportingSeriesTable.id, series.id))

      return true
    } catch (error) {
      console.error(`Failed to update supporting series status for ${series.id}:`, error)
      return false
    }
  }
} 