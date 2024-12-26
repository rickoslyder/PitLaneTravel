import { eq } from "drizzle-orm"
import { db } from "@/db/db"
import { racesTable, SelectRace } from "@/db/schema"
import { OpenF1Client } from "./client"
import { OpenF1Session } from "./types"
import { CircuitMapper } from "./circuit-mapper"

export class RaceMapper {
  private client: OpenF1Client
  private circuitMapper: CircuitMapper

  constructor() {
    this.client = new OpenF1Client()
    this.circuitMapper = new CircuitMapper()
  }

  /**
   * Initialize OpenF1 mappings for all races in our database for a given season
   */
  async initializeRaceMappings(season: number) {
    const races = await db.select().from(racesTable).where(eq(racesTable.season, season))
    let mappedCount = 0

    for (const race of races) {
      try {
        // Skip if already mapped
        if (race.openf1MeetingKey && race.openf1SessionKey) continue

        // Get OpenF1 circuit key for this race's circuit
        const openF1CircuitKey = await this.circuitMapper.getOpenF1Key(race.circuitId)
        if (!openF1CircuitKey) {
          console.warn(`No OpenF1 circuit mapping found for race: ${race.name}`)
          continue
        }

        // Get all sessions for this season
        const sessions = await this.client.getSessions(season)

        // Find matching race session
        const raceSession = sessions.find(
          session =>
            session.circuit_key === openF1CircuitKey &&
            session.session_type === "Race" &&
            new Date(session.date).toISOString().split("T")[0] === race.date.toISOString().split("T")[0]
        )

        if (raceSession) {
          await db
            .update(racesTable)
            .set({
              openf1MeetingKey: raceSession.meeting_key,
              openf1SessionKey: raceSession.session_key
            })
            .where(eq(racesTable.id, race.id))

          mappedCount++
        } else {
          console.warn(`No OpenF1 session found for race: ${race.name} on ${race.date}`)
        }
      } catch (error) {
        console.error(
          `Error mapping race ${race.name}:`,
          error instanceof Error ? error.message : error
        )
      }
    }

    return {
      totalRaces: races.length,
      mappedRaces: mappedCount
    }
  }

  /**
   * Get OpenF1 session key for a given race ID
   */
  async getOpenF1SessionKey(raceId: string): Promise<number | null> {
    const race = await db
      .select({ openf1SessionKey: racesTable.openf1SessionKey })
      .from(racesTable)
      .where(eq(racesTable.id, raceId))
      .limit(1)
      .then(rows => rows[0])

    return race?.openf1SessionKey ?? null
  }

  /**
   * Get OpenF1 meeting key for a given race ID
   */
  async getOpenF1MeetingKey(raceId: string): Promise<number | null> {
    const race = await db
      .select({ openf1MeetingKey: racesTable.openf1MeetingKey })
      .from(racesTable)
      .where(eq(racesTable.id, raceId))
      .limit(1)
      .then(rows => rows[0])

    return race?.openf1MeetingKey ?? null
  }

  /**
   * Get our race ID for a given OpenF1 session key
   */
  async getRaceId(openF1SessionKey: number): Promise<string | null> {
    const race = await db
      .select({ id: racesTable.id })
      .from(racesTable)
      .where(eq(racesTable.openf1SessionKey, openF1SessionKey))
      .limit(1)
      .then(rows => rows[0])

    return race?.id ?? null
  }

  /**
   * Get OpenF1 session details for a given race ID
   */
  async getOpenF1Session(raceId: string, season: number): Promise<OpenF1Session | null> {
    const sessionKey = await this.getOpenF1SessionKey(raceId)
    if (!sessionKey) return null

    try {
      const sessions = await this.client.getSessions(season)
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
   * Verify race mapping integrity for a given season
   */
  async verifyMappings(season: number) {
    const races = await db
      .select({
        id: racesTable.id,
        name: racesTable.name,
        openf1MeetingKey: racesTable.openf1MeetingKey,
        openf1SessionKey: racesTable.openf1SessionKey,
        date: racesTable.date
      })
      .from(racesTable)
      .where(eq(racesTable.season, season))

    const results = {
      total: races.length,
      mapped: 0,
      unmapped: 0,
      verified: 0,
      failed: 0,
      failures: [] as { raceId: string; name: string; reason: string }[]
    }

    for (const race of races) {
      if (!race.openf1MeetingKey || !race.openf1SessionKey) {
        results.unmapped++
        results.failures.push({
          raceId: race.id,
          name: race.name,
          reason: "No OpenF1 mapping"
        })
        continue
      }

      results.mapped++

      try {
        const sessions = await this.client.getSessions(season)
        const session = sessions.find(s => s.session_key === race.openf1SessionKey)

        if (session) {
          // Verify the session date matches our race date
          const sessionDate = new Date(session.date).toISOString().split("T")[0]
          const raceDate = race.date.toISOString().split("T")[0]

          if (sessionDate === raceDate) {
            results.verified++
          } else {
            results.failed++
            results.failures.push({
              raceId: race.id,
              name: race.name,
              reason: `Date mismatch: Race=${raceDate}, Session=${sessionDate}`
            })
          }
        } else {
          results.failed++
          results.failures.push({
            raceId: race.id,
            name: race.name,
            reason: "OpenF1 session not found"
          })
        }
      } catch (error) {
        results.failed++
        results.failures.push({
          raceId: race.id,
          name: race.name,
          reason: error instanceof Error ? error.message : String(error)
        })
      }
    }

    return results
  }

  async updateRaceStatus(race: SelectRace) {
    try {
      const openF1Session = await this.client.getSessions(race.openf1SessionKey!)
      if (!openF1Session?.length) {
        throw new Error(`No OpenF1 session found for race ${race.id}`)
      }

      // Update race status
      await db
        .update(racesTable)
        .set({
          status: openF1Session[0].status as any, // We'll need to make sure the enum values match
          updatedAt: new Date()
        })
        .where(eq(racesTable.id, race.id))

      return true
    } catch (error) {
      console.error(`Failed to update race status for ${race.id}:`, error)
      return false
    }
  }
} 